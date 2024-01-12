import { IJWTUtil } from "../contracts/utils/IJWTUtil"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"


import { NextFunction, Request, Response as ExpressResponse } from "express"

export class AuthJWT {

  private secretKey: string
  private jwtUtil: IJWTUtil

  constructor(secretKey: string, jwtUtil: IJWTUtil) {
    this.secretKey = secretKey
    this.jwtUtil = jwtUtil
  }

  authenticateToken = async (req: Request, res: ExpressResponse, next: NextFunction) => {
    const token = req.header("Authorization")
    try {
      const splitedToken = token?.split(" ")

      const decodedToken = await this.jwtUtil.decode(splitedToken![1], this.secretKey);

      if (!token || !decodedToken.getStatus()) {
        return res.status(401).json(
          new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.repoError)
            .setMessage("Unauthorized")
            .setData({}))
      }

      (req as any).user = decodedToken
      next()

    } catch (error) {
      return res.status(400).json(
        new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("invalid bearer token")
          .setData({}))
    }
  }
}
