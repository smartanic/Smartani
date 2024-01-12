import dotenv from "dotenv";
import assert from "assert";
import { Database } from "../../src/database/db";
import { IEdgeServerRepository } from "../../src/contracts/repositories/IEdgeServerRepository"
import { IEdgeServerService, SensorData } from "../../src/contracts/usecases/IEdgeServerService"
import { EdgeServerRepository } from "../../src/repositories/EdgeServerRepository"
import { EdgeServerService } from "../../src/usecases/edgeServer/EdgeServerService"
import { IUserRepository } from "../../src/contracts/repositories/IUserRepository"
import { UserRepository } from "../../src/repositories/UserRepository"
import { UserService } from "../../src/usecases/user/UserService"
import { IUserService } from "../../src/contracts/usecases/IUserService"
import { IJWTUtil } from "../../src/contracts/utils/IJWTUtil";
import { JWTUtil } from "../../src/utils/JWTUtil";
import { AuthGuard } from "../../src/middleware/AuthGuard";
import { UserRoles } from "../../src/contracts/middleware/AuthGuard";
import { OperationStatus } from "../../src/constants/operations";
import { mockMQTTService } from "../../src/usecases/mqtt/__mocks__/MQTTService"
import { Response } from "../../src/utils/Response";
import { IStorageService } from "../../src/contracts/usecases/IStorageServices"
import { StorageService } from "../../src/usecases/storage/StorageService"
import moment from "moment";

dotenv.config();

let db: Database = new Database(
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_HOST!,
    process.env.DB_PORT!,
    process.env.DB_NAME!,
    process.env.DB_DIALECT!,
)

let edgeServerRepo: IEdgeServerRepository
let userRepo: IUserRepository
let edgeServerService: IEdgeServerService
let userService: IUserService
let jwtUtil: IJWTUtil
let cloudStorageService: IStorageService

//dummy variable
let invitation_code: string = ""

beforeAll(async () => {

    try {
        mockMQTTService.publish.mockClear()
        mockMQTTService.subscribe.mockClear()
        mockMQTTService.connect.mockClear()

        jwtUtil = new JWTUtil()
        edgeServerRepo = new EdgeServerRepository()
        userRepo = new UserRepository()
        cloudStorageService = new StorageService()
        userService = new UserService(userRepo, cloudStorageService)
        edgeServerService = new EdgeServerService(jwtUtil, edgeServerRepo, mockMQTTService, userService)

        await db.connect()

        //create dummy users
        await db.getConnection().query(
            "INSERT INTO users (id, username, email, password, reset_token, is_verified, verification_code, created_at) VALUES " +
            "(10002, 'iyan', 'iyan@mail.com', '$2b$10$hT.yOgwP5SA3OuEKHQY1W.qpe7U1DOxAI3LcLuOt.SwJ7Hjvfv4cO', 'resettoken123', 0, '123456', '2023-09-11')," +
            "(20002, 'iyan22', 'iyan22@mail.com', '$2b$10$hT.yOgwP5SA3OuEKHQY1W.qpe7U1DOxAI3LcLuOt.SwJ7Hjvfv4cO', 'resettoken123', 0, '123456', '2023-09-11')"
        )

        //create dummy edge servers
        await db.getConnection().query("INSERT INTO edge_servers (name, vendor, description, mqtt_user, mqtt_password, mqtt_pub_topic, mqtt_sub_topic, invitation_code, invitation_expired_at) VALUES " +
            `('NUC 1001', 'INTEL', 'desc exmaple', 'user1', 'pass1', 'pub-topic-1', 'sub-topic-1', 'wikwik', '${moment().subtract(6, 'minute').format('Y-M-d h:mm:ss')}'),` + 
            `('NUC 1002', 'INTEL', 'desc exmaple', 'user2', 'pass2', 'pub-topic-2', 'sub-topic-2', 'yhyiii', '2024-11-03 11:48:38')`
        )
    } catch (error) {
        console.log(error)
    }
})

afterAll(async () => {
    await db.getConnection().query("DELETE FROM user_groups WHERE user_id in (10002, 20002)")
    await db.getConnection().query("DELETE FROM edge_servers WHERE name in ('server 1', 'server 2')")
    await db.getConnection().query("DELETE FROM users WHERE id in (10002, 20002)")
    await db.getConnection().query("DELETE FROM sensor_data")
    await db.getConnection().query("DELETE FROM devices WHERE vendor_name in ('vendor 1')")
})

describe("addEdgeServer", () => {

    //create auth guard
    const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

    it("success", async () => {
        const res = await edgeServerService.addEdgeServer(
            authGuard,
            "server 1",
            "intel",
            "desc 1"
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })

    //create auth guard
    const authGuard2 = new AuthGuard(20002, "iyan22@mail.com", "iyan", UserRoles.Admin);

    it("success user 2002", async () => {
        const res = await edgeServerService.addEdgeServer(
            authGuard2,
            "server 2",
            "intel",
            "desc 2"
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })
})

describe("fetch edge", () => {

    it("user does have edge", async () => {
        //create auth guard
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.fetchEdgeServer(authGuard)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 1)

    })

    it("user doesn't have edge", async () => {

        //create auth guard
        const authGuard = new AuthGuard(10001, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.fetchEdgeServer(authGuard)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 0)

    })

})

describe("add device", () => {

    it("success", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.addDevice(
            authGuard,
            edgeRes.getData()[0].id,
            "vendor 1",
            "123",
            "camera",
            "rtsp",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })

    it("failed due to invalid device type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.addDevice(
            authGuard,
            edgeRes.getData()[0].id,
            "vendor 1",
            "123",
            "motorcycle",
            "rtsp",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.addDeviceError)
    })

    it("failed due to invalid device source type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.addDevice(
            authGuard,
            edgeRes.getData()[0].id,
            "vendor 1",
            "123",
            "camera",
            "mqtt",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.addDeviceError)

    })
})

describe("fetch devices", () => {

    it("devices found", async () => {
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().devices.length, 1)
    })

    it("devices config found", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin, edgeRes.getData()[0].id);

        const res = await edgeServerService.fetchDevicesConfig(authGuard2)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 1)
        assert.notEqual(res.getData()[0].source_address, null)
    })

    it("devices not found", async () => {
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        // const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.fetchDevices(authGuard, 10)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData(), null)
    })

})

describe("view devices", () => {

    it("failed due to user is not part of user group", async () => {

        // Fetch edge server
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        // Fetch Edge Devices
        const devicesRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        // view device
        const authGuard2 = new AuthGuard(10003, "iyan1003@mai.com", "iyan1003", UserRoles.Admin);
        const res = await edgeServerService.viewDevice(authGuard2, edgeRes.getData()[0].id, devicesRes.getData().devices[0].id)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess)
        assert.equal(res.getData(), null)
        assert.equal(res.getStatus(), false)
    })

    it("failed device not found", async () => {

        // Fetch edge server
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        // view device
        const res = await edgeServerService.viewDevice(authGuard, edgeRes.getData()[0].id, 100)

        assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
        assert.equal(res.getData(), null)
        assert.equal(res.getStatus(), false)
    })

    it("success", async () => {

        // Fetch edge server
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        // Fetch Edge Devices
        const devicesRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        // view device
        const res = await edgeServerService.viewDevice(authGuard, edgeRes.getData()[0].id, devicesRes.getData().devices[0].id)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getStatus(), true)
        assert.notEqual(res.getData(), null)
        assert.equal(res.getData().vendor_name, "vendor 1")
        assert.equal(res.getData().notifications.length, 0)
    })
})

describe("update device", () => {

    it("success", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const fetchRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)
        // console.log(fetchRes)

        const res = await edgeServerService.updateDeviceConfig(
            authGuard,
            edgeRes.getData()[0].id,
            fetchRes.getData().devices[0].id,
            "vendor 1000",
            "PDIP-2034",
            "camera",
            "rtsp",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })

    it("failed due to invalid device type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const fetchRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        const res = await edgeServerService.updateDeviceConfig(
            authGuard,
            edgeRes.getData()[0].id,
            fetchRes.getData().id,
            "vendor 1000",
            "PDIP-2034",
            "motorcycle",
            "rtsp",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.updateDeviceError)
    })

    it("failed due to invalid device source type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const fetchRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        const res = await edgeServerService.updateDeviceConfig(
            authGuard,
            edgeRes.getData()[0].id,
            fetchRes.getData().id,
            "vendor 1000",
            "PDIP-2034",
            "camera",
            "mqtt",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.updateDeviceError)

    })
})

describe("create invitation member", () => {

    it("unauthorized due to user is not part of user group", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(10001, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.createEdgeMemberInvitation(authGuard2, edgeRes.getData()[0].id)

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess)
        assert.equal(res.getData(), null)

    })

    it("unauthorized due to user is not the owner", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(20001, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.createEdgeMemberInvitation(authGuard2, edgeRes.getData()[0].id)
        // console.log(res)
        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess)
        assert.equal(res.getData(), null)
    })

    it("success", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.createEdgeMemberInvitation(authGuard, edgeRes.getData()[0].id)
        // console.log(res)
        assert.equal(res.getStatus(), true)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.notEqual(res.getData().invitation_code, null)

        invitation_code = res.getData().invitation_code
    })

})

describe("join invitation member", () => {

    it("invalid code", async () => {

        const authGuard = new AuthGuard(20002, "iyan@mail.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.joinEdgeMemberInvitation(authGuard, "wj6fsh")

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.invitationCodeInvalid)
        assert.equal(res.getData(), null)
    })

    it("invalid code due to expired", async () => {

        const authGuard = new AuthGuard(20002, "iyan@mail.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.joinEdgeMemberInvitation(authGuard, "wikwik")

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.invitationCodeExpired)
        assert.equal(res.getData(), null)
    })

    it("success", async () => {

        const authGuard = new AuthGuard(20002, "iyan@mail.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.joinEdgeMemberInvitation(authGuard, "yhyiii")

        // console.log(res)
        assert.equal(res.getStatus(), true)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.notEqual(res.getData(), null)
    })

    it("failed due to user already joined the group", async () => {

        const authGuard = new AuthGuard(20002, "iyan@mail.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.joinEdgeMemberInvitation(authGuard, "yhyiii")

        // console.log(res)
        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.invitationCodeInvalid)
        assert.equal(res.getData(), null)
    })
})

describe("store sensor data", () => {

    it("failed invalid edge token", async () => {

        const authGuard = new AuthGuard(20002, "iyan@mail.com", "iyan", UserRoles.Admin);

        const data: SensorData[] = [{
            edge_server_id: 0,
            device_id: 0,
            data_measured: "{}",
            inference_label_status: "",
            captured_at: new Date()
        }]

        const res = await edgeServerService.storeSensorData(
            authGuard,
            0,
            data,
        )

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.invalidEdgeToken)
        assert.equal(res.getData(), null)
    })

    it("success", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin, edgeRes.getData()[0].id);

        const devicesRes = await edgeServerService.fetchDevices(authGuard2, edgeRes.getData()[0].id)

        const data: SensorData[] = [{
            edge_server_id: edgeRes.getData()[0].id,
            device_id: devicesRes.getData().devices[0].id,
            data_measured: "{}",
            inference_label_status: "danger",
            captured_at: new Date("2022-01-01")
        }]

        const res = await edgeServerService.storeSensorData(
            authGuard2,
            1,
            data,
        )

        // console.log(res)
        assert.equal(res.getStatus(), true)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 1)
    })
})

describe("read sensor data", () => {

    it("failed due to user is not part of edge server user group", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(10001, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.readSensorDataByDevice(authGuard2, edgeRes.getData()[0].id, 1, "2021-12-20", "2022-01-05")

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess)
        assert.equal(res.getData(), null)
    })

    it("success", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin, edgeRes.getData()[0].id);

        const devicesRes = await edgeServerService.fetchDevices(authGuard2, edgeRes.getData()[0].id)

        const res = await edgeServerService.readSensorDataByDevice(authGuard2, edgeRes.getData()[0].id, devicesRes.getData().devices[0].id, "2021-12-20", "2022-01-05")

        // console.log(res)
        assert.equal(res.getStatus(), true)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.notEqual(res.getData(), null)
        assert.equal(res.getData().length, 1)
        // assert.equal(res.getData()[0].unit_measure, "ph")
    })
})
