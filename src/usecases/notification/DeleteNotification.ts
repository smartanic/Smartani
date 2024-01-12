import { OperationStatus } from "../../constants/operations";
import { IAuthGuard, UserRoles } from "../../contracts/middleware/AuthGuard";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IUserRepository } from "@/contracts/repositories/IUserRepository";
import { IResponse } from "@/contracts/usecases/IResponse";

const deleteNotification = async function (
    authGuard: IAuthGuard,
    notifRepo: INotificationRepositories,
    userRepo: IUserRepository,
    notificationId: number,
    edgeServerId: number
): Promise<IResponse> {

    //1. check user group membership
    const userGroupResp = await userRepo.getUserGroupStatus(authGuard.getUserId(), edgeServerId)
    if (userGroupResp.isFailed()) {
        userGroupResp.setMessage("unauthorized")
        userGroupResp.setStatusCode(OperationStatus.unauthorizedAccess)
        return userGroupResp
    }

    //2. check role
    if(userGroupResp.getData().role_id != UserRoles.Admin) {
        userGroupResp.setStatus(false)
        userGroupResp.setMessage("unauthorized")
        userGroupResp.setStatusCode(OperationStatus.unauthorizedAccess)
        return userGroupResp
    }

    //2. fetch data
    const notifResponse = await notifRepo.find(notificationId)
    if (notifResponse.isFailed()) {
        return notifResponse
    }

    //3. delete
    return await notifRepo.delete(notificationId)
}

export { deleteNotification };