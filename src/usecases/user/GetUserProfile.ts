import { IResponse } from "@/contracts/usecases/IResponse"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { OperationStatus } from "../../constants/operations"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"

const dotenv = require("dotenv")

dotenv.config()

const getUserProfile = async function (
    authGuard: IAuthGuard,
    userRepo: IUserRepository
): Promise<IResponse> {
    const userData = await userRepo.findByEmail(authGuard.getUserEmail())

    if (userData.isFailed()) {
        userData.setStatusCode(OperationStatus.unauthorizedAccess)
        return userData
    }

    const userProfile = {
        "username": userData.getData().getDataValue("username"),
        "user_email": userData.getData().getDataValue("email"),
        "user_avatar": userData.getData().getDataValue("avatar")
    }

    userData.setData(userProfile)
    return userData
}

export { getUserProfile }

