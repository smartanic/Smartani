import { ICloudMessagingService } from "@/contracts/usecases/ICloudMessagingService";
import { IResponse } from "@/contracts/usecases/IResponse";
import { initializeApp, applicationDefault, App } from 'firebase-admin/app';
import { getMessaging, Messaging, MulticastMessage } from 'firebase-admin/messaging'

import { Response } from "../../utils/Response";

export class CloudMessagingService implements ICloudMessagingService {

    private app: App
    private messaging: Messaging

    constructor() {
        this.app = initializeApp({
            credential: applicationDefault(),
            // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
        })
        this.messaging = getMessaging(this.app);
    }

    isServiceConnected(): boolean {
        return this.app.name != "" ? true : false
    }

    async sendNotification(fcmRegistrationToken: string[], title: string, description: string, imageUrl: string, notificationId: string, deviceId: number, deviceType: string): Promise<IResponse> {

        let messagePayload: MulticastMessage = {
            data: {
                notificationId: String(notificationId),
                title: title,
                description: description,
                imageUrl: imageUrl,
                deeplinkURL: `https://ppidev.smartcube.com/notification/${notificationId}`,
                deviceId: String(deviceId),
                deviceType: deviceType
            },
            tokens: fcmRegistrationToken
        };

        try {
            let res = await this.messaging.sendEachForMulticast(messagePayload)
            // console.log(messageId)
            return new Response()
                .setStatus(true)
                .setStatusCode(1)
                .setMessage("ok")
                .setData(res)
                
        } catch (error: any) {
            return new Response()
            .setStatus(false)
            .setStatusCode(-1)
            .setMessage(error)
            .setData({})
        }

    }

}
