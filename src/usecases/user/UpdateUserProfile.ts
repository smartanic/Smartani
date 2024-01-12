import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories"
import { IStorageService } from "@/contracts/usecases/IStorageServices"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../../utils/Response"
import { IUploadedFile } from "@/contracts/IFile"
import { OperationStatus } from "../../constants/operations"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import UserEntity from "@/entities/UserEntity"

const dotenv = require("dotenv")

dotenv.config()

const updateUserProfile = async function (
    authGuard: IAuthGuard,
    userRepo: IUserRepository,
    cloudStorageService: IStorageService,
    file: IUploadedFile,
): Promise<IResponse> {
    const userData = await userRepo.findById(authGuard.getUserId())

    if (userData.isFailed()) {
        userData.setStatusCode(OperationStatus.unauthorizedAccess)
        return userData
    }

    //delete current avatar profile in cloud storage if exist
    const currentAvatarURL = userData.getData().getDataValue("avatar")

    if (currentAvatarURL != null) {
        const deleteResponse = await cloudStorageService.deleteFile(currentAvatarURL)
    }

    //upload file to cloud storage
    const uploadResponse = await cloudStorageService.uploadFile(file)
    if (uploadResponse.isFailed()) {
        uploadResponse.setStatusCode(OperationStatus.cloudStorageError)
        return uploadResponse
    }

    //update data
    const updateResponse = await userRepo.updateProfile(
        authGuard.getUserEmail(),
        uploadResponse.getData().fileUrl
    )
    if (updateResponse.isFailed()) {
        updateResponse.setStatusCode(OperationStatus.repoError)
        return updateResponse
    }

    updateResponse.setData(true)
    return updateResponse

}

export { updateUserProfile }

