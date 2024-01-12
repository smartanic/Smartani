import { OperationStatus } from "../constants/operations"
import { UserRoles } from "../contracts/middleware/AuthGuard";
import { IEdgeServerRepository } from "@/contracts/repositories/IEdgeServerRepository";
import { IResponse } from "@/contracts/usecases/IResponse";
import EdgeServerEntity from "../entities/EdgeServer";
import UserGroupEntity from "../entities/UserGroup";
import { Response } from "../utils/Response";
import DeviceEntity from "../entities/DeviceEntity";
import { Op } from "sequelize";
import { db } from "../entities/BaseEntity";
import SensorDataEntity from "../entities/SensorDataEntity";
import NotificationEntity from "../entities/NotificationEntity";

class EdgeServerRepository implements IEdgeServerRepository {

    async readSensorData(edgeServerId: number, deviceId: number | null, startDate: Date, endDate: Date): Promise<IResponse> {

        try {
            if (startDate > endDate) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.invalidDateRange)
                    .setMessage("invalid date range")
            }

            let q1 = null

            if (deviceId != null) {
                q1 = {
                    edge_server_id: edgeServerId,
                    device_id: deviceId,
                    captured_at: { [Op.between]: [startDate, endDate] },
                }
            } else {
                q1 = {
                    edge_server_id: edgeServerId,
                    captured_at: { [Op.between]: [startDate, endDate] },
                }
            }

            const res = await SensorDataEntity.findAll({
                where: q1,
                order: [
                    ['captured_at', 'DESC']
                ]
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async storeSensorData(data: any[]): Promise<IResponse> {

        try {
            const res = await SensorDataEntity.bulkCreate(data)
            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async getMqttConfig(edgeServerId: number): Promise<IResponse> {
        try {
            const data = await EdgeServerEntity.findOne({
                where: { id: edgeServerId },
                attributes: ['id', 'mqtt_sub_topic', 'mqtt_pub_topic']
            })

            if (data == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found!")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(data?.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async fetchEdge(userId: number): Promise<IResponse> {
        try {
            const res = await EdgeServerEntity.findAll(
                {
                    attributes: ["id", "name", "vendor"],
                    where: {
                        "$user_groups.user_id$": { [Op.eq]: userId }
                    },
                    include: {
                        model: UserGroupEntity,
                        required: true,
                        as: "user_groups",
                        attributes: []
                    }
                }
            )

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async viewDevice(deviceId: number): Promise<IResponse> {
        try {
            const data = await DeviceEntity.findOne({
                where: { id: deviceId },
                include: [
                    {
                        model: NotificationEntity,
                        as: "notifications",
                        required: false,
                        right: false
                    },
                    {
                        model: EdgeServerEntity,
                        as: "edge_servers",
                        required: true,
                        right: true,
                        attributes: ["id", "name", "vendor", "description"]
                    }
                ]
            })

            if (data == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found!")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(data?.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async fetchDevice(userId: number, edgeServerId: number): Promise<IResponse> {
        try {
            const res = await EdgeServerEntity.findOne(
                {
                    where: {
                        id: edgeServerId,
                    },
                    include: [
                        {
                            model: DeviceEntity,
                            as: "devices",
                            // required: true,
                        },
                        {
                            model: UserGroupEntity,
                            where: {
                                user_id: userId
                            },
                            required: true,
                            as: "user_groups",
                            attributes: []
                        }
                    ],
                }
            )

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }

    }

    async storeEdge(
        userId: number,
        name: string,
        vendor: string,
        description: string,
        mqttUser: string,
        mqttPassword: string,
        mqttPubTopic: string,
        mqttSubTopic: string): Promise<IResponse> {

        try {
            const edgeServer = await EdgeServerEntity.create({
                name: name,
                vendor: vendor,
                description: description,
                mqtt_user: mqttUser,
                mqtt_password: mqttPassword,
                mqtt_pub_topic: mqttPubTopic,
                mqtt_sub_topic: mqttSubTopic,
            })

            const userGroup = await UserGroupEntity.create({
                user_id: userId,
                edge_server_id: edgeServer.getDataValue('id'),
                role_id: UserRoles.Admin
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(edgeServer.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async storeDevice(
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
            const deviceRes = await DeviceEntity.create({
                vendor_name: vendorName,
                vendor_number: vendorNumber,
                type: type,
                source_type: sourceType,
                source_address: sourceAddress,
                assigned_model_type: assignedModelType,
                assigned_model_index: assignedModelIndex,
                additional_info: additionalInfo,
            })

            db.getConnection().query(`INSERT INTO devices_edge_servers (edge_server_id, device_id) VALUES (${edgeServerId}, ${deviceRes.getDataValue('id')})`)

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(deviceRes.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async updateDevice(
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
            const device = await DeviceEntity.update({
                vendor_name: vendorName,
                vendor_number: vendorNumber,
                type: type,
                source_type: sourceType,
                source_address: sourceAddress,
                assigned_model_type: assignedModelType,
                assigned_model_index: assignedModelIndex,
                additional_info: additionalInfo,
            }, {
                where: {
                    id: { [Op.eq]: deviceId },
                }
            })

            if (device[0] == 0) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(null)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error.message)
        }
    }

    async updateInvitationCode(edgeServerId: number, code: string | null, expire_at: Date | null): Promise<IResponse> {

        try {
            const edgeSeverUpdate = await EdgeServerEntity.update({
                invitation_code: code,
                invitation_expired_at: expire_at
            }, {
                where: {
                    id: edgeServerId
                }
            })

            if (edgeSeverUpdate[0] == 0) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(null)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error.message)
        }
    }

    async getEdgeServerByInvitationCode(code: string): Promise<IResponse> {
        try {
            const res = await EdgeServerEntity.findOne(
                {
                    where: {
                        invitation_code: code,
                    }
                }
            )

            if (res == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }
}

export { EdgeServerRepository }