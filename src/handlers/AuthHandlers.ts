import { IAuthService } from "@/contracts/usecases/IAuthService"
import { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"

export class AuthHandlers {
    private authService: IAuthService

    constructor(authService: IAuthService) {
        this.authService = authService
    }

    async loginHandler(req: ExpressRequest, res: ExpressResponse) {
        try {
            const loginResponse = await this.authService.login(
                req.body.email,
                req.body.password
            )

            if (loginResponse.isFailed()) {
                res.status(400)
                return res.json(loginResponse)
            }

            res.status(200)
            return res.json(loginResponse)
        } catch (error: any) {
            res.status(400)
            return res.json(
                new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(error)
            )
        }
    }

    async signUpHandler(req: ExpressRequest, res: ExpressResponse) {
        try {
            const signUpResponse = await this.authService.signUp(
                req.body.username,
                req.body.email,
                req.body.password,
                req.body.cPassword,
                req.body.fcmRegistrationToken
            )

            if (signUpResponse.isFailed()) {
                res.status(400)
                return res.json(signUpResponse)
            }
            res.status(200)
            return res.json(signUpResponse)
        } catch (error: any) {
            res.status(400)
            return res.json(
                new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(error)
            )
        }
    }

    async verificationHandler(req: ExpressRequest, res: ExpressResponse) {
        try {
            const verification = await this.authService.checkVerificationCode(
                req.body.email,
                req.body.verificationCode
            )
            if (verification.isFailed()) {
                res.status(400)
                return res.json(verification)
            }
            res.status(200)
            return res.json(verification)
        } catch (error: any) {
            res.status(400)
            return res.json(
                new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(error)
            )
        }
    }

    async resetPasswordReq(req: ExpressRequest, res: ExpressResponse) {
        try {
            const resetRequest = await this.authService.resetPasswordRequest(
                req.body.email
            )
            if (resetRequest.isFailed()) {
                res.status(400)
                return res.json(resetRequest)
            }
            res.status(200)
            return res.json(resetRequest)
        } catch (error: any) {
            res.status(400)
            return res.json(
                new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(error)
            )
        }
    }

    async resetPassword(req: ExpressRequest, res: ExpressResponse) {
        try {
            const reset = await this.authService.resetPassword(
                req.header("Authorization")!.split(" ")[1],
                req.body.password,
                req.body.cPassword
            )
            if (reset.isFailed()) {
                res.status(400)
                return res.json(reset)
            }
            res.status(200)
            return res.json(reset)
        } catch (error: any) {
            res.status(400)
            return res.json(
                new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(error)
            )
        }
    }
}

