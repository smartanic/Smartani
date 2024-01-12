import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { checkSchema } from 'express-validator'
import { Response } from "../utils/Response"
import { OperationStatus } from '../constants/operations'
import { AuthGuard } from '../middleware/AuthGuard'
import { IEdgeServerService } from '@/contracts/usecases/IEdgeServerService'
import { UserRoles } from '../contracts/middleware/AuthGuard'
import moment from 'moment'

export class EdgeServerHandlers {

    private edgeServerService: IEdgeServerService

    constructor(
        edgeServerService: IEdgeServerService
    ) {
        this.edgeServerService = edgeServerService
    }

    async addEdgeServer(req: ExpressRequest, res: ExpressResponse) {

        try {
            //0. validate request
            const result = await checkSchema({
                name: { notEmpty: true, },
                vendor: { notEmpty: true, },
                description: {}
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service 
            const newEdgeRes = await this.edgeServerService.addEdgeServer(
                authGuard,
                req.body.name,
                req.body.vendor,
                req.body.description,
            )

            if (newEdgeRes.isFailed()) {
                res.status(400)
                return res.json(newEdgeRes)
            }

            return res.json(newEdgeRes).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async addEdgeDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
                edge_server_id: { notEmpty: true, },
                vendor_name: { notEmpty: true, },
                vendor_number: { notEmpty: true, },
                type: { notEmpty: true, },
                source_type: { notEmpty: true, },
                source_address: { notEmpty: true },
                assigned_model_type: { notEmpty: true, },
                assigned_model_index: { notEmpty: true, },
                additional_info: {},
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const addDeviceResp = await this.edgeServerService.addDevice(
                authGuard,
                req.body.edge_server_id,
                req.body.vendor_name,
                req.body.vendor_number,
                req.body.type,
                req.body.source_type,
                req.body.source_address,
                req.body.assigned_model_type,
                req.body.assigned_model_index,
                req.body.additional_info,
            )

            if (addDeviceResp.isFailed()) {
                res.status(400)
                return res.json(addDeviceResp)
            }

            return res.json(addDeviceResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async updateEdgeDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0.1 validate request
            const validation1 = await checkSchema({
                edge_server_id: { notEmpty: true, },
                vendor_name: { notEmpty: true },
                vendor_number: { notEmpty: true, },
                type: { notEmpty: true, },
                source_type: { notEmpty: true, },
                source_address: { notEmpty: true },
                assigned_model_type: { notEmpty: true, },
                assigned_model_index: { notEmpty: true, },
                additional_info: {},
            }).run(req);

            for (const validation of validation1) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //0.2 validate request
            const validation2 = await checkSchema({
                id: { notEmpty: true },
            }, ['params']).run(req);

            for (const validation of validation2) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on param ${validation.context.fields[0]}`)
                    )
                }
            }

            const deviceId = parseInt(req.params.id)

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const addDeviceResp = await this.edgeServerService.updateDeviceConfig(
                authGuard,
                req.body.edge_server_id,
                deviceId,
                req.body.vendor_name,
                req.body.vendor_number,
                req.body.type,
                req.body.source_type,
                req.body.source_address,
                req.body.assigned_model_type,
                req.body.assigned_model_index,
                req.body.additional_info,
            )

            if (addDeviceResp.isFailed()) {
                res.status(400)
                return res.json(addDeviceResp)
            }

            return res.json(addDeviceResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async fetchEdgeServers(req: ExpressRequest, res: ExpressResponse) {
        try {

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const fetchResp = await this.edgeServerService.fetchEdgeServer(authGuard)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async fetchEdgeDevices(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const edgeServerId = parseInt(req.params.edge_server_id)
            const fetchResp = await this.edgeServerService.fetchDevices(authGuard, edgeServerId)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async viewDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            
             //0. validate request
             const result = await checkSchema({
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const edgeServerId = parseInt(req.params.edge_server_id)
            const deviceId = parseInt(req.params.device_id)
            const resp = await this.edgeServerService.viewDevice(authGuard, edgeServerId, deviceId)

            switch (resp.getStatusCode()) {
                case OperationStatus.success:
                    return res.json(resp).status(200)
                case OperationStatus.repoErrorModelNotFound:
                    return res.json(resp).status(404)
                case OperationStatus.unauthorizedAccess:
                    return res.json(resp).status(403)
                default:
                    return res.json(resp).status(400)
            }


        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async fetchDevicesConfig(req: ExpressRequest, res: ExpressResponse) {
        try {
            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const fetchResp = await this.edgeServerService.fetchDevicesConfig(authGuard)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async restartDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
                edge_server_id: { notEmpty: true, },
                process_index: { notEmpty: true, },
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin)

            //3. invoke service
            const fetchResp = await this.edgeServerService.restartDevice(authGuard, req.body.process_index, req.body.edge_server_id)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async startDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
                edge_server_id: { notEmpty: true, },
                process_index: { notEmpty: true, },
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin)

            //3. invoke service
            const fetchResp = await this.edgeServerService.startDevice(authGuard, req.body.process_index, req.body.edge_server_id)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async createEdgeMemberInvitation(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
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

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke 
            const edgeServerId = parseInt(req.params.edge_server_id)
            const inviteRes = await this.edgeServerService.createEdgeMemberInvitation(authGuard, edgeServerId)

            if (inviteRes.isFailed()) {
                switch (inviteRes.getStatusCode()) {
                    case OperationStatus.unauthorizedAccess:
                        res.status(403)
                        break;
                    default:
                        res.status(400)
                        break;
                }

                return res.json(inviteRes)
            }

            return res.json(inviteRes).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async joinEdgeMemberInvitation(req: ExpressRequest, res: ExpressResponse) {

        try {
            //0.1 validate request
            const validation1 = await checkSchema({
                invitation_code: { notEmpty: true, },
            }).run(req);

            for (const validation of validation1) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke
            const joinResp = await this.edgeServerService.joinEdgeMemberInvitation(
                authGuard,
                req.body.invitation_code
            )

            if (joinResp.isFailed()) {
                res.status(400)
                return res.json(joinResp)
            }

            return res.json(joinResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }

    }

    async storeSensorData(req: ExpressRequest, res: ExpressResponse) {
        try {

            //0. validate request
            const result = await checkSchema({
                device_id: { notEmpty: true, isNumeric: true },
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

            //0.1 validate request
            const validation1 = await checkSchema({
                data: {
                    isArray: {
                        bail: true,
                        options: {
                            min: 0
                        },
                    }
                },
                "data.*.edge_server_id": {
                    isInt: true,
                },
                "data.*.device_id": {
                    isInt: true,
                },
                "data.*.inference_label_status": {
                    isString: true,
                },
                "data.*.captured_at": {
                    isDate: true
                },
                "data.*.data_measured": {
                    isArray: {
                        bail: true,
                        options: {
                            min: 1
                        },
                    }
                },
                "data.*.data_measured.*.sensor_type": {
                    isString: true,
                },
                "data.*.data_measured.*.data": {
                    isInt: true,
                },
                "data.*.data_measured.*.unit_measure": {
                    isString: true,
                }
            }).run(req);

            for (const validation of validation1) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. execute
            const deviceId = parseInt(req.params.device_id)
            const storeRes = await this.edgeServerService.storeSensorData(authGuard, deviceId, req.body.data)

            if (storeRes.isFailed()) {
                res.status(400)
                return res.json(storeRes)
            }

            return res.json(storeRes)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async readSensorDataByDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            
            //0. validate request
            const result = await checkSchema({
                edge_server_id: { notEmpty: true, isNumeric: true },
                device_id: { notEmpty: true, isNumeric: true },
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

            //0. validate request
            const queryValidation = await checkSchema({
                start_date: { isDate: true },
                end_date: { isDate: true },
            }, ['query']).run(req);

            for (const validation of queryValidation) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on query ${validation.context.fields[0]}`)
                    )
                }
            }


            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. execute
            const edgeServerId = parseInt(req.params.edge_server_id)
            const deviceId = parseInt(req.params.device_id)
            const startDate = req.query.start_date == undefined ? moment().subtract(1, 'days').toDate().toString() : String(req.query.start_date)
            const endDate = req.query.end_date == undefined ? moment().add(1, 'days').toDate().toString() : String(req.query.end_date)
            const dataRes = await this.edgeServerService.readSensorDataByDevice(authGuard, edgeServerId, deviceId, startDate, endDate)

            if (dataRes.isFailed()) {
                res.status(400)
                return res.json(dataRes)
            }

            return res.json(dataRes)
            
        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }
}