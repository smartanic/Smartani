import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../../utils/Response";

const fetchAllNotification = async function(
    authGuard: IAuthGuard, 
    notifRepo: INotificationRepositories
    ): Promise<IResponse> {

    const notifResponse = await notifRepo.fetchAll(authGuard.getUserId())

    return notifResponse
}

export { fetchAllNotification };