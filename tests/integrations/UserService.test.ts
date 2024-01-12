import dotenv from "dotenv"
import assert from "assert"
import fs from "fs"

import { IUserService } from "../../src/contracts/usecases/IUserService"
import { UserService } from "../../src/usecases/user/UserService"
import { IUserRepository } from "../../src/contracts/repositories/IUserRepository"
import { UserRepository } from "../../src/repositories/UserRepository"
import { IStorageService } from "../../src/contracts/usecases/IStorageServices"
import { StorageService } from "../../src/usecases/storage/StorageService"
import { IUploadedFile } from "../../src/contracts/IFile"
import { OperationStatus } from "../../src/constants/operations"
import { AuthGuard } from "../../src/middleware/AuthGuard"
import { UserRoles } from "../../src/contracts/middleware/AuthGuard"
import { Database } from "../../src/database/db"

dotenv.config()

let db: Database = new Database(
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_HOST!,
    process.env.DB_PORT!,
    process.env.DB_NAME!,
    process.env.DB_DIALECT!
)

let userService: IUserService
let userRepository: IUserRepository
let cloudStorageService: IStorageService

beforeAll(async () => {
    //Connect db
    await db.connect()
    //create dummy data user, notification, devices, and user_groups with id 10003
    try {
        await db
            .getConnection()
            .query(
                "INSERT INTO users (id, username, email, password, created_at) VALUES (10003, 'iyan', 'iyan@mail.com', 'pass123', '2023-09-09')"
            )
    } catch (error) {
        throw error
    }

    //Instantiate services
    userRepository = new UserRepository()
    cloudStorageService = new StorageService()
    userService = new UserService(userRepository, cloudStorageService)
})

afterAll(async () => {
    await db.getConnection().query("DELETE FROM users WHERE id = 10003")
})

const filePath = process.cwd() + "/tests/images/img1.png"
const buffer = fs.readFileSync(filePath)
const file: IUploadedFile = {
    buffer: buffer,
    originalname: "img1.png",
    mimetype: "image/png",
}

describe("get user profile", () => {
    it("failed unauthorized", async () => {
        const authGuard = new AuthGuard(0, "", "", UserRoles.Admin, 10003)

        const res = await userService.getUserProfile(authGuard)

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess)
    })

    it("successfully get user profile", async () => {
        const authGuard = new AuthGuard(
            10003,
            "iyan@mail.com",
            "iyan",
            UserRoles.Admin,
            10003
        )

        const res = await userService.getUserProfile(authGuard)

        assert.ok(res.getStatus())
        assert.equal(res.getStatusCode(), OperationStatus.success)
    })
})

describe("update avatar profile", () => {
    it("failed update avatar profile due to unauthorized access", async () => {
        //create auth guard
        const authGuard = new AuthGuard(
            0,
            "iyan2@mail.com",
            "iyan",
            UserRoles.Admin,
            10003
        )
        //execute usecase
        const resp = await userService.updateUserProfile(authGuard, file)

        //assert
        assert.equal(resp.getStatus(), false)
        assert.equal(
            OperationStatus.unauthorizedAccess,
            resp.getStatusCode()
        )
    })

    it("update avatar profile successfully", async () => {
        //create auth guard
        const authGuard = new AuthGuard(
            10003,
            "iyan@mail.com",
            "iyan",
            UserRoles.Admin,
            10003
        )

        //execute usecase
        const res = await userService.updateUserProfile(
            authGuard,
            file
        )

        console.log(res)
        //assert
        assert.ok(res.getStatus())
        assert.equal(res.getStatusCode(), OperationStatus.success)
    })
})

describe("update user fcm registration token", () => {
    it("failed update user fcm registration token due to unauthorized access", async () => {
        //create auth guard
        const authGuard = new AuthGuard(
            0,
            "iyan2@mail.com",
            "iyan",
            UserRoles.Admin,
            10003
        )
        //execute usecase
        const resp = await userService.updateFcmRegistrationToken(authGuard, "12312")

        //assert
        assert.equal(resp.getStatus(), false)
        assert.equal(
            OperationStatus.unauthorizedAccess,
            resp.getStatusCode()
        )
    })

    it("update user fcm registration token successfully", async () => {
        //create auth guard
        const authGuard = new AuthGuard(
            10003,
            "iyan@mail.com",
            "iyan",
            UserRoles.Admin,
            10003
        )

        //execute usecase
        const res = await userService.updateFcmRegistrationToken(
            authGuard,
            "123123"
        )

        console.log(res)
        //assert
        assert.ok(res.getStatus())
        assert.equal(res.getStatusCode(), OperationStatus.success)
    })
})
