import { IResponse } from "../usecases/IResponse";

export interface INotificationRepositories {
    storeNotification(
        userId: number, 
        edgeServerId: number, 
        deviceId: number,
        deviceType: string,
        objectLabel: string,
        riskLevel: string, 
        title: string, 
        description: string, 
        imageUrl: string | null
    ): Promise<IResponse>
    fetchAll(userId: number): Promise<IResponse>
    find(id: number): Promise<IResponse>
    delete(id: number): Promise<IResponse>
}