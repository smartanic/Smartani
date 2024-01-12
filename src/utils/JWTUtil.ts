import { IResponse } from "@/contracts/usecases/IResponse"
import { IJWTUtil } from "@/contracts/utils/IJWTUtil"
import jwt from "jsonwebtoken"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"

export class JWTUtil implements IJWTUtil {
  constructor() {}

  async encode(payload: object, secretKey: string, time: string): Promise<IResponse> {
    try {
      const signed = await jwt.sign(payload, secretKey, { expiresIn: time })
      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(signed)
    } catch (error:any) {
      return new Response()
      .setStatus(false)
      .setStatusCode(OperationStatus.repoError)
      .setMessage(error)
      .setData({ error: error })
    }
  }

  async decode(token: string, secretKey: string): Promise<IResponse> {
    try {
      const decoded = await jwt.verify(token, secretKey)
      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(decoded)
    } catch (error: any) {
      return new Response()
      .setStatus(false)
      .setStatusCode(OperationStatus.repoError)
      .setMessage(error)
      .setData({ error: error })
    }
  }
}
// decode(token: string, secretKey: string): JSON {
//   const verify = jwt.verify(token, secretKey, (err: any, decoded: any) => {
//     if (err) {
//       return err
//     }
//     return decoded
//   })

//   return verify

// }

