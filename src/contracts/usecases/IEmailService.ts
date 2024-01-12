import { IResponse } from "./IResponse"

export interface IEmailService {
    sendEmail(email: string, subject: string, body: string): Promise<IResponse>
    closeService(): void
}
