import { IResponse } from "../usecases/IResponse"

export interface IJWTUtil {
    encode(payload: object, secretKey: string, time: string): Promise<IResponse>
    decode(token: string, secretKey: string): Promise<IResponse>
}

