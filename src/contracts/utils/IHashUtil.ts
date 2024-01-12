import { IResponse } from "../usecases/IResponse"

export interface IHashUtil {
  hash(payload: string): Promise<IResponse>
  compare(payload: string, hashedPayload: string): Promise<IResponse>
}

