import { SensorData } from "../usecases/IEdgeServerService";
import { IResponse } from "../usecases/IResponse";

export interface IEdgeServerRepository {

    getMqttConfig(edgeServerId: number): Promise<IResponse>
    
    fetchEdge(userId: number): Promise<IResponse>

    fetchDevice(userId: number, edgeServerId: number): Promise<IResponse>

    viewDevice(deviceId: number): Promise<IResponse>

    storeEdge(
        userId: number,
        name: string,
        vendor: string,
        description: string,
        mqttUser: string,
        mqttPassword: string,
        mqttPubTopic: string,
        mqttSubTopic: string,
    ): Promise<IResponse>

    storeDevice(
        edgeServerId: number,
        vendorName: string,
        vendorNumber: string,
        type: string,
        sourceType: string,
        sourceAddress: string,
        assignedModelType: number,
        assignedModelIndex: number,
        additionalInfo: any
    ): Promise<IResponse>

    updateDevice(
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

    updateInvitationCode(edgeServerId: number, code: string|null, expire_at: Date|null): Promise<IResponse>

    getEdgeServerByInvitationCode(code: string): Promise<IResponse>

    storeSensorData(data: SensorData[]): Promise<IResponse>

    readSensorData(edgeServerId: number, deviceId: number|null, startDate: Date, endDate: Date): Promise<IResponse>
}