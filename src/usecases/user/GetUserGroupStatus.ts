import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { IUserRepository } from "@/contracts/repositories/IUserRepository";
import { IResponse } from "@/contracts/usecases/IResponse";


const getUserGroupStatus = async function (
    userRepository: IUserRepository,
    authGuard: IAuthGuard,
    edgeServerId: number,
): Promise<IResponse> {

    const userGroupRes = await userRepository.getUserGroupStatus(
        authGuard.getUserId(),
        edgeServerId,
    )

    if (userGroupRes.isFailed()) {
        if (userGroupRes.getStatusCode() == OperationStatus.repoErrorModelNotFound) {
            userGroupRes.setMessage("unathorized access")
            userGroupRes.setStatusCode(OperationStatus.unauthorizedAccess)
            return userGroupRes
        }

        return userGroupRes
    }

    return userGroupRes

}

export { getUserGroupStatus }