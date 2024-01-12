import { INotificationService } from "@/contracts/usecases/INotificationService";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { storeNotification } from "./StoreNotification";
import { ICloudMessagingService } from "@/contracts/usecases/ICloudMessagingService";
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { IUploadedFile } from "@/contracts/IFile";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { viewNotification } from "./ViewNotification";
import { deleteNotification } from "./DeleteNotification";
import { fetchAllNotification } from "./FetchAllNotification";
import { IUserRepository } from "@/contracts/repositories/IUserRepository";
import { IEmailService } from "@/contracts/usecases/IEmailService";

class NotificationService implements INotificationService {

    notifRepo: INotificationRepositories
    userRepo: IUserRepository
    cloudMessageService: ICloudMessagingService
    cloudStorageService: IStorageService
    emailService: IEmailService

    constructor(
        userRepo: IUserRepository,
        notifRepo: INotificationRepositories,
        cloudMessageService: ICloudMessagingService,
        cloudStorageService: IStorageService,
        emailService: IEmailService
    ) {
        this.notifRepo = notifRepo;
        this.cloudMessageService = cloudMessageService;
        this.cloudStorageService = cloudStorageService
        this.userRepo = userRepo
        this.emailService = emailService
    }
    storeNotification(
        authGuard: IAuthGuard,
        file: IUploadedFile | null,
        deviceId: number,
        deviceType: string,
        objectLabel: string,
        riskLevel: string,
        title: string,
        description: string
    ): Promise<IResponse> {
        return storeNotification(
            authGuard,
            this.notifRepo,
            this.userRepo,
            this.cloudMessageService,
            this.cloudStorageService,
            file,
            deviceId,
            deviceType,
            objectLabel,
            riskLevel,
            title,
            description
        )
    }

    viewNotification(authGuard: IAuthGuard, id: number, edgeServerId: number): Promise<IResponse> {
        return viewNotification(authGuard, this.notifRepo, this.userRepo, id, edgeServerId)
    }

    fetchAllNotification(authGuard: IAuthGuard,): Promise<IResponse> {
        return fetchAllNotification(authGuard, this.notifRepo)
    }

    deleteNotification(authGuard: IAuthGuard, id: number, edgeServerId: number): Promise<IResponse> {
        return deleteNotification(authGuard, this.notifRepo, this.userRepo, id, edgeServerId)
    }

    sendResetPasswordToken(email: string, resetToken: string): Promise<IResponse> {
        return this.emailService.sendEmail(email, 'Reset Token', resetToken)
    }
    sendSignUpVerificationCode(email: string, code: string): Promise<IResponse> {
        return this.emailService.sendEmail(email, 'Verification Token', code)
    }
}

export { NotificationService }
