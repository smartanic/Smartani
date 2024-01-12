import { OperationStatus } from "../../constants/operations"
import { IAuthGuard, UserRoles } from '../../contracts/middleware/AuthGuard';
import { IEdgeServerRepository } from '@/contracts/repositories/IEdgeServerRepository';
import { IEdgeServerService, SensorData } from '@/contracts/usecases/IEdgeServerService'
import { IResponse } from '../../contracts/usecases/IResponse';
import { IJWTUtil } from '@/contracts/utils/IJWTUtil';
import { Response } from '../../utils/Response';
import { generateRandomString } from '../../utils/String';
import { IMQTTService } from "@/contracts/usecases/IMQTTService";
import DeviceEntity from "@/entities/DeviceEntity";
import { IUserService } from "@/contracts/usecases/IUserService";
import moment from "moment";

class EdgeServerService implements IEdgeServerService {

    private modelType = ['objectDetection', 'dataAnalytic']
    private deviceType = ['camera', 'sensor']
    private deviceSourceType = ['usb', 'rtsp', 'http']

    private jwtUtil: IJWTUtil;
    private edgeServerRepo: IEdgeServerRepository
    private mqttService: IMQTTService
    private userService: IUserService

    constructor(
        jwtUtil: IJWTUtil,
        edgeServerRepo: IEdgeServerRepository,
        mqttService: IMQTTService,
        userService: IUserService,
    ) {
        this.jwtUtil = jwtUtil
        this.edgeServerRepo = edgeServerRepo
        this.mqttService = mqttService
        this.userService = userService
    }

    async storeSensorData(authGuard: IAuthGuard, deviceId: number, sensorData: SensorData[]): Promise<IResponse> {
        if (authGuard.getEdgeServerId() == 0 || authGuard.getEdgeServerId() == undefined) {
            return new Response()
                .setMessage("invalid edge token")
                .setStatusCode(OperationStatus.invalidEdgeToken)
                .setStatus(false)
        }

        // console.log(sensorData)
        sensorData.map((val, i, data) => {
            data[i].edge_server_id = authGuard.getEdgeServerId()
        })
        
        const res = await this.edgeServerRepo.storeSensorData(sensorData)
        return res
    }   

    async readSensorDataByDevice(authGuard: IAuthGuard, edgeServerId: number, deviceId: number, startDate: string, endDate: string): Promise<IResponse> {
        
        //1. fetch user group
        const userGroupResp = await this.userService.getUserGroupStatus(authGuard, edgeServerId)
        if(userGroupResp.isFailed()) return userGroupResp

        const startDateConf = new Date(startDate)
        const endDateConf = new Date(endDate)
        const res = await this.edgeServerRepo.readSensorData(edgeServerId, deviceId, startDateConf, endDateConf)

        return res
    }

    async createEdgeMemberInvitation(authGuard: IAuthGuard, edgeSeverId: number): Promise<IResponse> {

        //1. fetch user group
        const userGroupResp = await this.userService.getUserGroupStatus(authGuard, edgeSeverId)
        if(userGroupResp.isFailed()) return userGroupResp

        //2. check ownership
        if(userGroupResp.getData().role_id != UserRoles.Admin) {
            userGroupResp.setStatus(false)
            userGroupResp.setData(null)
            userGroupResp.setMessage("unauthorized")
            userGroupResp.setStatusCode(OperationStatus.unauthorizedAccess)
            return userGroupResp
        }
        
        //3. generate invitation code
        const invitationCode = generateRandomString(12)

        //4. save invitation code & expire date
        this.edgeServerRepo.updateInvitationCode(edgeSeverId, invitationCode, moment().add(5, 'minute').toDate())

        userGroupResp.setData({'invitation_code': invitationCode})
        userGroupResp.setMessage("ok")
        return userGroupResp
    }

    async joinEdgeMemberInvitation(authGuard: IAuthGuard, invitationCode: string): Promise<IResponse> {
        
        const edgeServerResp = await this.edgeServerRepo.getEdgeServerByInvitationCode(invitationCode)
        
        if(edgeServerResp.isFailed()) {
            edgeServerResp.setMessage("invitation code invalid")
            edgeServerResp.setStatusCode(OperationStatus.invitationCodeInvalid)
            return edgeServerResp
        }

        if(new Date(edgeServerResp.getData().invitation_expired_at) < new Date()) {            
            edgeServerResp.setMessage("invitation code expired")
            edgeServerResp.setStatusCode(OperationStatus.invitationCodeExpired)
            edgeServerResp.setData(null)
            edgeServerResp.setStatus(false)
            return edgeServerResp
        }

        const userGroupResp = await this.userService.getUserGroupStatus(authGuard, edgeServerResp.getData().id)
        if(userGroupResp.getStatus()) {
            userGroupResp.setStatus(false)
            userGroupResp.setStatusCode(OperationStatus.invitationCodeInvalid)
            userGroupResp.setMessage("you are already join this group")
            userGroupResp.setData(null)
            return userGroupResp
        }

        const addUserGroupResp = await this.userService.addUserGroup(authGuard, edgeServerResp.getData().id, UserRoles.Member)
        if(addUserGroupResp.isFailed()) {
            return addUserGroupResp
        }        

        return addUserGroupResp
    }

    async addEdgeServer(
        authGuard: IAuthGuard,
        name: string,
        vendor: string,
        description: string
    ): Promise<IResponse> {

        //1. validatedevSourceId: string,
        // if(authGuard.getUserRole() != UserRoles.Admin) 
        //     return new Response()
        //         .setStatus(false)
        //         .setStatusCode(OperationStatus.unauthorizedAccess)
        //         .setMessage("unauthorized")

        //2. Generate MQTT Config
        const mqttConfig = this.generateEdgeServerConfig(authGuard).getData()

        //3. Store Config
        const res = await this.edgeServerRepo.storeEdge(
            authGuard.getUserId(),
            name,
            vendor,
            description,
            mqttConfig.mqttUser,
            mqttConfig.mqttPassword,
            mqttConfig.mqttPubTopic,
            mqttConfig.mqttSubTopic)

        if (res.isFailed()) return res

        //4. Generate Edge Server Access Token
        const edgeAccessTokenPayload = {
            userId: authGuard.getUserId(),
            email: authGuard.getUserEmail(),
            username: authGuard.getUsername(),
            edgeServerId: res.getData().id
        }

        const edgeAccessTokenRes = await this.jwtUtil.encode(edgeAccessTokenPayload, process.env.JWT_SECRET_KEY!, "9999y")
        if (edgeAccessTokenRes.isFailed()) return edgeAccessTokenRes

        return new Response()
            .setStatus(true)
            .setStatusCode(OperationStatus.success)
            .setMessage("ok")
            .setData({
                edgeServerId: res.getData().id,
                mqtt_user: mqttConfig.mqttUser,
                mqtt_password: mqttConfig.mqttPassword,
                mqtt_pub_topic: mqttConfig.mqttPubTopic,
                mqtt_sub_topic: mqttConfig.mqttSubTopic,
                egde_server_access_token: edgeAccessTokenRes.getData()
            })
    }

    async addDevice(
        authGuard: IAuthGuard,
        edgeServerId: number,
        vendorName: string,
        vendorNumber: string,
        type: string,
        sourceType: string,
        sourceAddress: string,
        assignedModelType: number,
        assignedModelIndex: number,
        additionalInfo: any
    ): Promise<IResponse> {
        try {
            //1. validate input
            if (!this.deviceType.includes(type)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.addDeviceError)
                    .setMessage("invalid device type")
            }

            if (!this.deviceSourceType.includes(sourceType)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.addDeviceError)
                    .setMessage("invalid device source type")
            }

            //3. fetch mqtt pub-sub topic from edge server config
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            //5. send restart device instruction
            // const restartRes = await this.mqttService.publish(
            //     mqttConfigRes.getData().mqtt_sub_topic,
            //     "/restartDevice 1"
            // )
            // if (restartRes.isFailed()) return restartRes

            //6. save input
            const storeRes = await this.edgeServerRepo.storeDevice(
                edgeServerId,
                vendorName,
                vendorNumber,
                type,
                sourceType,
                sourceAddress,
                assignedModelType,
                assignedModelIndex,
                additionalInfo
            )
            if (storeRes.isFailed()) return storeRes

            //4. sync config to the edge server
            const syncConfigRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/syncEdgeConfig`
            )
            if (syncConfigRes.isFailed()) return syncConfigRes

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(storeRes.getData())

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.addDeviceError)
                .setMessage(error)
        }
    }

    async viewDevice(authGuard: IAuthGuard, edgeServerID: number, deviceID: number): Promise<IResponse> {
        
        //1. fetch user group
        const userGroupResp = await this.userService.getUserGroupStatus(authGuard, edgeServerID)
        if(userGroupResp.isFailed()) return userGroupResp

        return this.edgeServerRepo.viewDevice(deviceID)
    }

    async fetchEdgeServer(authGuard: IAuthGuard): Promise<IResponse> {
        return await this.edgeServerRepo.fetchEdge(authGuard.getUserId())
    }

    async fetchDevices(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse> {
        return await this.edgeServerRepo.fetchDevice(authGuard.getUserId(), edgeServerId)
    }

    async fetchDevicesConfig(authGuard: IAuthGuard): Promise<IResponse> {
        try {
            if (authGuard.getEdgeServerId() == 0 || authGuard.getEdgeServerId() == undefined) {
                return new Response()
                    .setMessage("it seems you're trying to fetch devices config using user token")
                    .setStatusCode(OperationStatus.invalidEdgeToken)
                    .setStatus(false)
            }

            const devicesResp = await this.edgeServerRepo.fetchDevice(
                authGuard.getUserId(),
                authGuard.getEdgeServerId()
            )

            if (devicesResp.isFailed()) return devicesResp

            const devices: DeviceEntity[] = (devicesResp.getData() != null ? devicesResp.getData().devices : [])

            const devicesConfig: {
                device_id: any;
                device_vendor_name: any,
                edge_server_name: any,
                type: any;
                source_type: any;
                source_address: any;
                assigned_model_type: string;
                assigned_model_index: any;
                additional_info: any;
            }[] = []

            devices.forEach((device) => {
                devicesConfig.push({
                    device_id: device.getDataValue('id'),
                    device_vendor_name: device.getDataValue('vendor_name'),
                    edge_server_name: devicesResp.getData().getDataValue('name'),
                    type: device.getDataValue('type'),
                    source_type: device.getDataValue('source_type'),
                    source_address: device.getDataValue('source_address'),
                    assigned_model_type: this.modelType[device.getDataValue('assigned_model_type')],
                    assigned_model_index: device.getDataValue('assigned_model_index'),
                    additional_info: device.getDataValue('additional_info')
                })
            })

            return devicesResp
                .setData(devicesConfig)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.generateEdgeDeviceConfigError)
                .setMessage(`generate edge devices config error ${error}`)
        }

    }

    async updateDeviceConfig(
        authGuard: IAuthGuard,
        edgeServerId: number,
        deviceId: number,
        vendorName: string,
        vendorNumber: string,
        type: string,
        sourceType: string,
        sourceAddress: string,
        assignedModelType: number,
        assignedModelIndex: number,
        additionalInfo: any
    ): Promise<IResponse> {
        try {
            //1. validate input
            if (!this.deviceType.includes(type)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.updateDeviceError)
                    .setMessage("invalid device type")
            }

            if (!this.deviceSourceType.includes(sourceType)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.updateDeviceError)
                    .setMessage("invalid device source type")
            }
            
            //3. fetch mqtt pub-sub topic from edge server config
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            //2. save input
            const storeRes = await this.edgeServerRepo.updateDevice(
                deviceId,
                vendorName,
                vendorNumber,
                type,
                sourceType,
                sourceAddress,
                assignedModelType,
                assignedModelIndex,
                additionalInfo
            )
            if (storeRes.isFailed()) return storeRes

            //4. sync config to the edge server
            const syncConfigRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/syncEdgeConfig`
            )
            if (syncConfigRes.isFailed()) return syncConfigRes

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(storeRes.getData())
                
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.updateDeviceError)
                .setMessage(error)
        }
    }

    async restartDevice(authGuard: IAuthGuard, processIndex: number, edgeServerId: number): Promise<IResponse> {

        try {
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            const restartRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/restartDevice ${processIndex}`
            )

            return restartRes
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.deviceRestartError)
                .setMessage(`error restarting device ${error}`)
        }

    }

    async startDevice(authGuard: IAuthGuard, processIndex: number, edgeServerId: number): Promise<IResponse> {

        try {
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            const restartRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/startDevice ${processIndex}`
            )

            return restartRes
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.deviceRestartError)
                .setMessage(`error starting device: ${error}`)
        }
    }

    generateEdgeServerConfig(authGuard: IAuthGuard): IResponse {
        return new Response()
            .setData({
                mqttUser: generateRandomString(6) + "-" + authGuard.getUserEmail(),
                mqttPassword: generateRandomString(12),
                mqttPubTopic: "pub-" + generateRandomString(6),
                mqttSubTopic: "sub-" + generateRandomString(6)
            })
    }
}

export { EdgeServerService }
