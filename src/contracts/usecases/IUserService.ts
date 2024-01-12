import { IResponse } from "./IResponse";
import { IAuthGuard, UserRoles } from "../middleware/AuthGuard";
import { IUploadedFile } from "../IFile";

export interface IUserService {
    getUserProfile(authGuard: IAuthGuard): Promise<IResponse>
    getUserGroupStatus(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse>
    addUserGroup(authGuard: IAuthGuard, edgeServerId: number, roleId: UserRoles): Promise<IResponse>
    updateUserProfile(authGuard: IAuthGuard, file: IUploadedFile): Promise<IResponse> 
    updateFcmRegistrationToken(authGuard: IAuthGuard, fcmRegistrationToken: string): Promise<IResponse>
}
