import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../utils/Response";
import { OperationStatus } from "../constants/operations";
import NotificationEntity from '../entities/NotificationEntity'
import UserGroupEntity from "../entities/UserGroup";
import { Op } from "sequelize";
import EdgeServerEntity from "../entities/EdgeServer";

class NotificationRepository implements INotificationRepositories {

    async storeNotification(
        userId: number, 
        edgeServerId: number, 
        deviceId: number,
        deviceType: string,
        objectLabel: string,
        riskLevel: string, 
        title: string, 
        description: string, 
        imageUrl: string | null
    ): Promise<IResponse> {

        try {
            const newNotif = await NotificationEntity.create({
                user_id: userId,
                edge_server_id: edgeServerId,
                device_id: deviceId,
                device_type: deviceType,
                object_label: objectLabel,
                risk_level: riskLevel,
                title: title,
                image: imageUrl,
                description: description,
                is_viewed: false,
                created_at: new Date(),
                updated_at: new Date(),
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(newNotif.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async fetchAll(userId: number): Promise<IResponse> {
        try {
            let notifData = await NotificationEntity.findAll({ 
                include: {
                    model: EdgeServerEntity,
                    required: true,
                    attributes: [],
                    right: true,
                    include: [{
                        model: UserGroupEntity,
                        as: "user_groups",
                        attributes: [],
                        where: {
                            user_id: { [Op.eq]: userId }
                        },
                        right: true,
                    }]
                }
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(notifData)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async find(id: number): Promise<IResponse> {
        try {
            let notifData = await NotificationEntity.findOne({ where: { id: id } })
            if (notifData == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found!")
                    .setData({})
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(notifData.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async delete(id: number): Promise<IResponse> {

        try {
            const res = await NotificationEntity.destroy({ where: { id: id } })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData({})

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }
}

export { NotificationRepository }