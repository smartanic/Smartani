import { IResponse } from "./IResponse";
import { IUploadedFile } from "../IFile";
import { IAuthGuard } from "../middleware/AuthGuard";

export interface INotificationService {
    storeNotification(
        authGuard: IAuthGuard, 
        file: IUploadedFile | null, 
        deviceId: number,
        deviceType: string,
        objectLabel: string,
        riskLevel: string, 
        title: string, 
        description: string
    ): Promise<IResponse>
    viewNotification(authGuard: IAuthGuard, id: number, edgeServerId: number): Promise<IResponse>
    fetchAllNotification(authGuard: IAuthGuard,): Promise<IResponse>
    deleteNotification(authGuard: IAuthGuard, id: number, edgeServerId: number): Promise<IResponse>
    sendResetPasswordToken(email: string, resetToken: string): Promise<IResponse>
    sendSignUpVerificationCode(email: string, code: string): Promise<IResponse>
}