import { OperationStatus } from "../../constants/operations";
import { IEmailService } from "@/contracts/usecases/IEmailService";
import { IResponse } from "../../contracts/usecases/IResponse";
import { Response } from "../../utils/Response";
import nodemailer from 'nodemailer';

export class EmailService implements IEmailService {

    private client;
    private senderEmail;
    private senderName;

    constructor(
        smtpHost: string,
        smtpPort: number,
        smtpUser: string,
        smtpPassword: string,
        senderEmail: string, 
        senderName: string = "Smartcube Support",
        ) {

        this.senderEmail = senderEmail
        this.senderName = senderName
        this.client = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: false,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });
    }

    async sendEmail(email: string, subject: string, body: string): Promise<IResponse> {
        try {

            const resp = await this.client.sendMail({
                from: this.senderEmail,
                to: email,
                subject: subject,
                text: body,
                html: body,
            });

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(resp.messageId)

        } catch (error: any) {

            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.sendEmailError)
                .setMessage(error)
        }
    }

    closeService(): void {
        this.client.close()
    }

}
