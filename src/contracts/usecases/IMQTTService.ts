import "@/utils/Response"
import { IResponse } from "./IResponse"

export interface IMQTTService {
    connect(): Promise<IResponse>
    publish(topic: string, payload: string): Promise<IResponse>
    subscribe(topic: string, payload: string): Promise<IResponse>
}