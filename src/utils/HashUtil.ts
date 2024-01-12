import { IHashUtil } from "@/contracts/utils/IHashUtil"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"
import * as bcrypt from "bcrypt"

export class HashUtil implements IHashUtil {
  async hash(payload: string): Promise<IResponse> {
    const saltRounds = 10
    try {
      const salt = await bcrypt.genSalt(saltRounds)
      const hash = await bcrypt.hash(payload, salt)
      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(hash)
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.fieldValidationError)
        .setMessage(error)
        .setData({ error: error })
    }
  }

  async compare(payload: string, hashedPayload: string): Promise<IResponse> {
    try {
      const match = await bcrypt.compare(payload, hashedPayload)
      return new Response()
        .setStatus(match)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.fieldValidationError)
        .setMessage(error)
    }
  }
}

