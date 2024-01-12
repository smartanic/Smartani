import { INotificationService } from '@/contracts/usecases/INotificationService'
import { NotificationHandlers } from './NotificationHandlers'
import express, { Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import { IAuthService } from '@/contracts/usecases/IAuthService'
import { AuthHandlers } from './AuthHandlers'
import { AuthJWT } from '../middleware/AuthJWT'
import { IJWTUtil } from '../contracts/utils/IJWTUtil'
import { EdgeServerHandlers } from './EdgeServerHandlers'
import { IEdgeServerService } from '@/contracts/usecases/IEdgeServerService'
import { UserHandlers } from './UserHandlers'
import { IUserService } from '@/contracts/usecases/IUserService'

export function runHttpHandlers(
    notificationService: INotificationService,
    authService: IAuthService,
    edgeServerService: IEdgeServerService,
    jwtUtil: IJWTUtil,
    userService: IUserService
) {

    //Instantiate express
    const app = express()
    app.use(express.urlencoded({extended: true}))
    const port = process.env.APP_PORT ??= '3000'

    app.use(express.json())
    app.use(fileUpload())

    //Instantiate Handlers
    const notifHandler = new NotificationHandlers(notificationService)
    const authHandler = new AuthHandlers(authService)
    const edgeServerHandler = new EdgeServerHandlers(edgeServerService)
    const userHandler = new UserHandlers(userService)

    //Middlware
    const jwtMiddleware = new AuthJWT(process.env.JWT_SECRET_KEY!, jwtUtil)
    const jwtMiddlewareResetReq = new AuthJWT(process.env.RESET_TOKEN_SECRET_KEY!, jwtUtil)

    //Notification
    app.post('/notification', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.storeNotificationHandler(req, res))
    app.get('/notification', jwtMiddleware.authenticateToken , async (req: Request, res: Response) => notifHandler.fetchAllNotificationHandler(req, res))
    app.get('/notification/:id/edge-server/:edge_server_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.viewNotificationHandler(req, res))
    app.delete('/notification/:id/edge-server/:edge_server_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.deleteNotificationHandler(req, res))
    
    //Auth
    app.post('/login', async (req:Request, res: Response) => authHandler.loginHandler(req, res))
    app.post('/signup', async (req:Request, res: Response) => authHandler.signUpHandler(req, res))
    app.post('/verification', async (req:Request, res: Response) => authHandler.verificationHandler(req, res))
    app.post('/reset-password-request', async (req:Request, res: Response) => authHandler.resetPasswordReq(req, res))
    app.post('/reset-password', jwtMiddlewareResetReq.authenticateToken, async (req:Request, res: Response) => authHandler.resetPassword(req, res))
    
    //Edge Server
    app.post('/edge-server', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.addEdgeServer(req, res))
    app.post('/edge-device', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.addEdgeDevice(req, res))
    app.get('/edge-server', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.fetchEdgeServers(req, res))
    app.get('/edge-device/:edge_server_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.fetchEdgeDevices(req, res))
    app.put('/edge-device/:id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.updateEdgeDevice(req, res))
    app.get('/edge-device-config', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.fetchDevicesConfig(req, res))
    app.post('/edge-device-restart', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.restartDevice(req, res))
    app.post('/edge-device-start', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.startDevice(req, res))
    app.get('/edge-server-user-invite/:edge_server_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.createEdgeMemberInvitation(req, res))
    app.post('/edge-server-user-join', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.joinEdgeMemberInvitation(req, res))
    app.post('/edge-device-sensor/:device_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.storeSensorData(req, res))
    app.get('/edge-device-sensor/server/:edge_server_id/device/:device_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.readSensorDataByDevice(req, res))
    app.get('/edge-device/:edge_server_id/view/:device_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.viewDevice(req, res))

    //User
    app.get('/user-profile', jwtMiddleware.authenticateToken, async (req:Request, res: Response) => userHandler.getUserProfile(req, res))
    app.put('/user-profile/:id', jwtMiddleware.authenticateToken, async (req:Request, res: Response) => userHandler.updateUserProfile(req, res))
    app.patch('/user-profile/fcm', jwtMiddleware.authenticateToken, async (req:Request, res: Response) => userHandler.updateFcmRegistrationToken(req, res))

    //Listening 
    app.listen(port, () => {
        console.log(`app listening on port ${port}`)
    })
}
