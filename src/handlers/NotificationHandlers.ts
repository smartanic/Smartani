import { INotificationService } from "@/contracts/usecases/INotificationService"
import { AuthGuard } from "../middleware/AuthGuard"
import { UserRoles } from '../contracts/middleware/AuthGuard'
import { IUploadedFile } from "@/contracts/IFile"
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { UploadedFile } from "express-fileupload"
import { checkSchema } from "express-validator"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"

class NotificationHandlers {

    private notificationService: INotificationService;

    constructor(notificationService: INotificationService) {
        this.notificationService = notificationService
    }

    async storeNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        try {
            //0. validate request
            const result = await checkSchema({
                // image: { notEmpty: true,  },
                title: { notEmpty: true, },
                description: { notEmpty: true, },
                device_id: { notEmpty: true, },
                device_type: { notEmpty: true, },
                // object_label: { notEmpty: true, },
                // risk_level: { notEmpty: true, }, 
            }).run(req);

            for (const validation of result) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //temporary validate image files
            // if (req.files == null && req.files == undefined) {
            //     res.status(400)
            //     return res.json((new Response())
            //         .setStatus(false)
            //         .setStatusCode(OperationStatus.fieldValidationError)
            //         .setMessage(`invalid on field image`)
            //     )
            // }

            let uploadedFile: IUploadedFile | null = null;

            if (req.files != null) {
                const file = req.files!.image as UploadedFile
                if (!(['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype))) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`invalid on field image`)
                    )
                }

                //3. parsing file multipart/form-data
                uploadedFile = {
                    buffer: file.data,
                    originalname: file.name,
                    mimetype: file.mimetype
                }
            }

            //1. extract jwt
            const userData = (req as any).user


            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //4. execute
            const notifResponse = await this.notificationService.storeNotification(
                authGuard,
                uploadedFile,
                req.body.device_id,
                req.body.device_type,
                req.body.object_label,
                req.body.risk_level,
                req.body.title,
                req.body.description
            )

            if (notifResponse.isFailed()) {
                res.status(400)
                return res.json(notifResponse)
            }

            return res.json(notifResponse).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error.toString())
            )
        }


    }

    async fetchAllNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        try {
            //1. extract jwt
            const userData = (req as any).user
            // console.log('user data:',userData.getData().userId)
            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            const fetchResponse = await this.notificationService.fetchAllNotification(authGuard)
            
            //3. execute
            if (fetchResponse.isFailed()) {
                res.status(400)
                return res.json(fetchResponse)
            }
    
            return res.json(fetchResponse).status(200)
        } catch (error:any) {
            res.status(400)
            return res.json({error: error})
        }


    }

    async viewNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        //0. validate request
        const result = await checkSchema({
            id: { notEmpty: true, isNumeric: true },
            edge_server_id: { notEmpty: true, isNumeric: true },
        }, ['params']).run(req);

        for (const validation of result) {
            if (!validation.isEmpty()) {
                res.status(400)
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`${validation.array()[0].msg} on param ${validation.context.fields[0]}`)
                )
            }
        }

        const notifId = parseInt(req.params.id)
        const edgeServerId = parseInt(req.params.edge_server_id)

        //1. extract jwt
        const userData = (req as any).user

        //2. build authGuard
        const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

        //3. execute
        const viewResponse = await this.notificationService.viewNotification(authGuard, notifId, edgeServerId)

        if (viewResponse.isFailed()) {
            return res.json(viewResponse).status(400)
        }

        return res.json(viewResponse).status(200)
    }

    async deleteNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        //0. validate request
        const result = await checkSchema({
            id: { notEmpty: true, isNumeric: true },
            edge_server_id: { notEmpty: true, isNumeric: true },
        }, ['params']).run(req);

        for (const validation of result) {
            if (!validation.isEmpty()) {
                res.status(400)
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`${validation.array()[0].msg} on param ${validation.context.fields[0]}`)
                )
            }
        }

        const notifId = parseInt(req.params.id)
        const edgeServerId = parseInt(req.params.edge_server_id)

        //1. extract jwt
        const userData = (req as any).user

        //2. build authGuard
        const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

        //3. execute
        const deleteResponse = await this.notificationService.deleteNotification(authGuard, notifId, edgeServerId)

        if (deleteResponse.isFailed()) {
            return res.json(deleteResponse).status(400)
        }

        return res.json(deleteResponse).status(200)
    }
}

export { NotificationHandlers }
