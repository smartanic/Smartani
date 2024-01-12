import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories"
import { ICloudMessagingService } from "@/contracts/usecases/ICloudMessagingService"
import { IStorageService } from "@/contracts/usecases/IStorageServices"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../../utils/Response"
import { IUploadedFile } from "@/contracts/IFile"
import { OperationStatus } from "../../constants/operations"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import UserEntity from "@/entities/UserEntity"

const storeNotification = async function (
    authGuard: IAuthGuard,
    notifRepo: INotificationRepositories,
    userRepo: IUserRepository,
    cloudMessageService: ICloudMessagingService,
    cloudStorageService: IStorageService,
    file: IUploadedFile | null,
    deviceId: number,
    deviceType: string,
    objectLabel: string,
    riskLevel: string,
    title: string,
    description: string
): Promise<IResponse> {

    //1. 
    const userResponse = await userRepo.findByEmail(authGuard.getUserEmail())
    if (userResponse.isFailed()) {
        return userResponse
    }

    //2. Fetch User Group to get the fcm registration token
    const usersGroupResp = await userRepo.fetchUserByGroup(
        authGuard.getUserId(),
        authGuard.getEdgeServerId()
    )

    if (usersGroupResp.isFailed()) {
        if (
            authGuard.getEdgeServerId() == 0 ||
            authGuard.getEdgeServerId() == undefined
        ) {
            usersGroupResp.setMessage(
                "it seems you're trying to store notification using user token"
            )
            usersGroupResp.setStatusCode(OperationStatus.invalidEdgeToken)
            return usersGroupResp
        }
        return usersGroupResp
    }

    const fcmRegistrationTokens = usersGroupResp
        .getData().users
        ?.map((user: UserEntity) => user.dataValues.fcm_registration_token)

    
    let uploadResponse = null

    if (file != null) {
        //3. upload file to cloud storage
        uploadResponse = await cloudStorageService.uploadFile(file)
        if (uploadResponse.isFailed()) {
            uploadResponse.setStatusCode(OperationStatus.cloudStorageError)
            return uploadResponse
        }
    }

    //4. save data to repo
    let storeResponse = await notifRepo.storeNotification(
        authGuard.getUserId(),
        authGuard.getEdgeServerId(),
        deviceId,
        deviceType,
        objectLabel,
        riskLevel,
        title,
        description,
        uploadResponse == null ? null : uploadResponse.getData().fileUrl
    )
    if (storeResponse.isFailed()) {
        storeResponse.setStatusCode(OperationStatus.repoError)
        return storeResponse
    }

    //5. broadcast notification to registered devices
    cloudMessageService.sendNotification(
        fcmRegistrationTokens,
        title,
        description,
        uploadResponse == null ? "" : uploadResponse.getData().fileUrl,
        storeResponse.getData().id,
        deviceId,
        deviceType
    )

    return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(storeResponse.getData())
}

export { storeNotification }

