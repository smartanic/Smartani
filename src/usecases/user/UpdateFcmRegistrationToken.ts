import { IResponse } from "@/contracts/usecases/IResponse"
import { OperationStatus } from "../../constants/operations"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"

const dotenv = require("dotenv")

dotenv.config()

const updateFcmRegistrationToken = async function (
    authGuard: IAuthGuard,
    userRepo: IUserRepository,
    fcmRegistrationToken: string
): Promise<IResponse> {
    const userData = await userRepo.findById(authGuard.getUserId())

    if (userData.isFailed()) {
        userData.setStatusCode(OperationStatus.unauthorizedAccess)
        return userData
    } 

    //update data
    console.log
    const updateResponse = await userRepo.updateFcmRegistrationToken(
        userData.getData().email,
        fcmRegistrationToken
    )

    console.log("updateResponse",updateResponse)

    if (updateResponse.isFailed()) {
        updateResponse.setStatusCode(OperationStatus.repoError)
        return updateResponse
    }

    return updateResponse

}

export { updateFcmRegistrationToken }
