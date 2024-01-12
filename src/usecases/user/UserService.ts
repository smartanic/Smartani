import { IUserService } from "@/contracts/usecases/IUserService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { IAuthGuard, UserRoles } from "@/contracts/middleware/AuthGuard"
import { IUploadedFile } from "@/contracts/IFile"
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { getUserProfile } from "./GetUserProfile"
import { getUserGroupStatus } from "./GetUserGroupStatus"
import { addUserGroup } from "./AddUserGroup"
import { updateUserProfile } from "./UpdateUserProfile"
import { updateFcmRegistrationToken } from "./UpdateFcmRegistrationToken";

class UserService implements IUserService {
    userRepo: IUserRepository
    storageService: IStorageService

    constructor(userRepo: IUserRepository, storageService: IStorageService) {
        this.userRepo = userRepo
        this.storageService = storageService
    }

    async getUserProfile(authGuard: IAuthGuard): Promise<IResponse> {
        return getUserProfile(authGuard, this.userRepo)
    }

    async getUserGroupStatus(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse> {
        return getUserGroupStatus(this.userRepo, authGuard, edgeServerId)
    }

    async addUserGroup(authGuard: IAuthGuard, edgeServerId: number, roleId: UserRoles): Promise<IResponse> {
        return addUserGroup(this.userRepo, authGuard.getUserId(), edgeServerId, roleId) 
    }
    
    async updateUserProfile(authGuard: IAuthGuard, file: IUploadedFile): Promise<IResponse> {
        return updateUserProfile(authGuard, this.userRepo, this.storageService, file)
    }

    async updateFcmRegistrationToken(authGuard: IAuthGuard, fcmRegistrationToken: string): Promise<IResponse> {
        return updateFcmRegistrationToken(authGuard, this.userRepo, fcmRegistrationToken)
    }
}

export { UserService }

