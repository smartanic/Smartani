import { IAuthGuard, UserRoles } from "@/contracts/middleware/AuthGuard"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"


const addUserGroup = async function(
    userRepo: IUserRepository,
    userId: number,
    edgeServerId: number,
    userRole: UserRoles,
) {
    return await userRepo.addUserGroup(userId, edgeServerId, userRole)
}

export { addUserGroup }