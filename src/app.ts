import { NotificationRepository } from './repositories/NotificationRepository'
import { StorageService } from './usecases/storage/StorageService'
import { CloudMessagingService } from './usecases/cloudMessage/CloudMessagingService'
import { NotificationService } from './usecases/notification/NotificationService'
import { runHttpHandlers } from './handlers/HttpHandlers'
import { AuthService } from './usecases/auth/AuthService'
import { JWTUtil } from './utils/JWTUtil'
import { UserRepository } from './repositories/UserRepository'
import { HashUtil } from './utils/HashUtil'
import { EmailService } from './usecases/email/EmailService'
import { MQTTService } from './usecases/mqtt/MQTTService'
import { EdgeServerService } from './usecases/edgeServer/EdgeServerService'
import { EdgeServerRepository } from './repositories/EdgeServerRepository'
import { UserService } from './usecases/user/UserService'

async function main() {

    //Instantiate utilities
    const jwtUtil = new JWTUtil()
    const hashUtil = new HashUtil()

    //Instantiate Repositories
    const userRepository = new UserRepository()
    const notificationRepository = new NotificationRepository()
    const edgeServerRepository = new EdgeServerRepository()

    //Instantiate External Services
    const cloudStorageService = new StorageService()
    const cloudMessageService = new CloudMessagingService()
    const emailService = new EmailService(
        process.env.SMTP_HOST!,
        Number(process.env.SMTP_PORT!),
        process.env.SMTP_USER!,
        process.env.SMTP_USER_PASSWORD!,
        process.env.SENDER_EMAIL!
    )
    const mqttService = new MQTTService(
        process.env.MQTT_PROTOCOL!,
        process.env.MQTT_HOST!,
        process.env.MQTT_PORT!,
        process.env.MQTT_CA_CERT!,
        process.env.MQTT_USERNAME!,
        process.env.MQTT_PASSWORD!,
    )
    await mqttService.connect()

    //Internal Services (Usecases)
    const notificationService = new NotificationService(userRepository, notificationRepository, cloudMessageService, cloudStorageService, emailService)
    const authService = new AuthService(userRepository, jwtUtil, hashUtil, notificationService)
    const userService = new UserService(userRepository, cloudStorageService)
    const edgeServerService = new EdgeServerService(jwtUtil, edgeServerRepository, mqttService, userService)

    //Http Handlers
    runHttpHandlers(notificationService, authService, edgeServerService, jwtUtil, userService)
}

main()
