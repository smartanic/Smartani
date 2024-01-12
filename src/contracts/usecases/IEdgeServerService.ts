import "@/utils/Response"
import { IResponse } from "./IResponse"
import { IAuthGuard } from "../middleware/AuthGuard"

export interface SensorData {
    edge_server_id: number,
    device_id: number,
    data_measured: any,
    inference_label_status: string,
    captured_at: Date
}

export interface IEdgeServerService {
    addEdgeServer(
        authGuard: IAuthGuard,
        name: string,
        vendor: string,
        description: string,
    ): Promise<IResponse>
    
    addDevice(
        authGuard: IAuthGuard,
        edgeServerID: number,
        vendorName: string,
        vendorNumber: string,
        type: string,
        sourceType: string,
        sourceAddress: string,
        assignedModelType: number,
        assignedModelIndex: number,
        additionalInfo: any
    ): Promise<IResponse>
    
    viewDevice(
        authGuard: IAuthGuard,
        edgeServerID: number,
        deviceID: number,
    ): Promise<IResponse>

    fetchEdgeServer(
        authGuard: IAuthGuard,
    ): Promise<IResponse>
    fetchDevices(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse>
    fetchDevicesConfig(authGuard: IAuthGuard): Promise<IResponse>
    updateDeviceConfig(
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
    ): Promise<IResponse>
    restartDevice(authGuard: IAuthGuard, processIndex: number, edgeServerId: number): Promise<IResponse>
    startDevice(authGuard: IAuthGuard, processIndex: number, edgeServerId: number): Promise<IResponse>
    generateEdgeServerConfig(authGuard: IAuthGuard): IResponse
    createEdgeMemberInvitation(authGuard: IAuthGuard, edgeSeverId: number): Promise<IResponse>
    joinEdgeMemberInvitation(authGuard: IAuthGuard, invitationCode: string): Promise<IResponse>
    storeSensorData(authGuard: IAuthGuard, deviceId: number, sensorData: SensorData[]): Promise<IResponse>
    readSensorDataByDevice(authGuard: IAuthGuard, edgeServerId: number, deviceId: number, startDate: string, endData: string): Promise<IResponse>
}