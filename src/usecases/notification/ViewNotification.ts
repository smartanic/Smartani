import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../../utils/Response";
import { IUserRepository } from "@/contracts/repositories/IUserRepository";

const viewNotification = async function(
    authGuard: IAuthGuard, 
    notifRepo: INotificationRepositories,
    userRepo: IUserRepository,
    notificationId: number,
    edgeServerId: number): Promise<IResponse> {

    //1. check user group membership
    const userGroupResp = await userRepo.getUserGroupStatus(authGuard.getUserId(), edgeServerId)
    
    if(userGroupResp.isFailed()) {
        userGroupResp.setMessage("unauthorized")
        userGroupResp.setStatusCode(OperationStatus.unauthorizedAccess)
        return userGroupResp
    }

    //2. if user part of the group, then fetch the data
    const notifResponse = await notifRepo.find(notificationId)

    if(notifResponse.isFailed()) return notifResponse

    return notifResponse
}

export { viewNotification };