import { IAuthService } from "@/contracts/usecases/IAuthService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../../utils/Response"
import { OperationStatus } from "../../constants/operations"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IJWTUtil } from "@/contracts/utils/IJWTUtil"
import { IHashUtil } from "@/contracts/utils/IHashUtil"
import { INotificationService } from "@/contracts/usecases/INotificationService"
import { generateRandomString } from "../../utils/String"

const dotenv = require("dotenv")

dotenv.config()

class AuthService implements IAuthService {
    userRepo: IUserRepository
    jwtUtil: IJWTUtil
    hashUtil: IHashUtil
    notificationService: INotificationService

    constructor(
        userRepo: IUserRepository,
        jwtUtil: IJWTUtil,
        hashUtil: IHashUtil,
        notificationService: INotificationService
    ) {
        this.userRepo = userRepo
        this.jwtUtil = jwtUtil
        this.hashUtil = hashUtil
        this.notificationService = notificationService
    }

    async login(email: string, password: string): Promise<IResponse> {
        const secretKey = process.env.JWT_SECRET_KEY || ""

        try {
            const userResponse = await this.userRepo.findByEmail(email)

            if (!userResponse.getStatus()) {
                userResponse.setStatusCode(
                    OperationStatus.authInvalidCredential
                )
                return userResponse
            }

            const compareResult = await this.hashUtil.compare(
                password,
                userResponse.getData().getDataValue("password")
            )

            if (!compareResult.getStatus()) {
                compareResult.setStatusCode(
                    OperationStatus.authInvalidCredential
                )
                compareResult.setMessage("invalid credential")
                compareResult.setData(undefined)
                return compareResult
            }

            if (!userResponse.getData().getDataValue("is_verified")) {
                userResponse.setStatus(false)
                userResponse.setStatusCode(OperationStatus.authUnverified)
                userResponse.setMessage("User is unverified")
                userResponse.setData(undefined)
                return userResponse
            }

            const accessTokenPayload = {
                userId: userResponse.getData().getDataValue("id"),
                email: userResponse.getData().getDataValue("email"),
                username: userResponse.getData().getDataValue("username"),
            }

            const generatedToken = await this.jwtUtil.encode(
                accessTokenPayload,
                secretKey,
                "168h"
            )

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData({ accessToken: generatedToken.getData() })
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.authServiceError)
                .setMessage(error)
        }
    }

    async signUp(
        username: string,
        email: string,
        password: string,
        cPassword: string,
        fcmRegistrationToken: string
    ): Promise<IResponse> {
        try {
            const userResponse = await this.userRepo.findByEmail(email)
            if (userResponse.getStatus()) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelExist)
                    .setMessage("email already exist")
            }

            if (password !== cPassword) {
                return userResponse
                    .setStatus(false)
                    .setStatusCode(OperationStatus.signUpErrorInvalidData)
                    .setMessage("password is not the same")
            }

            const hashPassword = await this.hashUtil.hash(password)

            const verificationCode = generateRandomString(6)

            const storeUserResponse = await this.userRepo.store(
                username,
                email,
                hashPassword.data,
                verificationCode,
                fcmRegistrationToken
            )

            const sendVerificationCode =
                this.notificationService.sendSignUpVerificationCode(
                    email,
                    verificationCode
                )
            storeUserResponse.getData().setDataValue("verification_code", null)
            return storeUserResponse
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.authServiceError)
                .setMessage(error)
        }
    }

    async checkVerificationCode(
        email: string,
        verification_code: string
    ): Promise<IResponse> {
        try {
            const userResponse = await this.userRepo.findByVerificationCode(
                email,
                verification_code
            )

            if (!userResponse.getStatus()) {
                userResponse.setStatusCode(
                    OperationStatus.verificationCodeInvalid
                )
                userResponse.setMessage("invalid verification code!")
                return userResponse
            }

            const setVerifiedResponse =
                await this.userRepo.updateVerificationStatus(email, Boolean(1))

            if (!setVerifiedResponse.getStatus()) {
                return setVerifiedResponse
            }

            return await this.userRepo.findByEmailNoPassword(email)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.authServiceError)
                .setMessage(error)
        }
    }

    async resetPasswordRequest(email: string): Promise<IResponse> {
        try {
            const user = await this.userRepo.findByEmail(email)
            if (!user.getStatus()) {
                user.setStatusCode(OperationStatus.authInvalidCredential)
                user.setMessage("email does not exist!")
                return user
            }

            const resetToken = await this.jwtUtil.encode(
                { email: email },
                process.env.RESET_TOKEN_SECRET_KEY!,
                "5m"
            )

            const setToken = await this.userRepo.storeResetToken(
                email,
                resetToken.getData()
            )

            if (!setToken.getStatus()) {
                return setToken
                    .setStatus(false)
                    .setStatusCode(OperationStatus.jwtGenerateError)
                    .setMessage("gagal update")
            }
            const resetPassURL =
                process.env.RESET_PASSWORD_URL + resetToken.getData()
            const resetPassMessage =
                "Silakan klik link berikut untuk mengatur ulang password Anda:<br>" +
                resetPassURL

            this.notificationService.sendResetPasswordToken(
                email,
                resetPassMessage
            )

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("reset link has been sent")
                .setData(null)
        } catch (error) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.authServiceError)
                .setMessage("error")
                .setData({})
        }
    }

    async resetPassword(
        resetToken: string,
        password: string,
        cPassword: string
    ): Promise<IResponse> {
        try {
            if (password !== cPassword) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.authInvalidCredential)
                    .setMessage("password tidak sama!")
            }

            const decodedToken = await this.jwtUtil.decode(
                resetToken,
                process.env.RESET_TOKEN_SECRET_KEY!
            )
            if (!decodedToken.getStatus()) {
                decodedToken.setStatusCode(
                    OperationStatus.authInvalidCredential
                )
                decodedToken.setMessage("invalid token")
                return decodedToken
            }

            const hashedPassword = await this.hashUtil.hash(password)

            const updatePassword = await this.userRepo.updatePassword(
                hashedPassword.getData(),
                resetToken
            )

            return updatePassword
        } catch (error) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage("error")
        }
    }
}

export { AuthService }

