import dotenv from "dotenv"
import assert from "assert"
import fs from "fs"

import { NotificationRepository } from "../../src/repositories/NotificationRepository"
import { INotificationRepositories } from "../../src/contracts/repositories/INotificationRepositories"
import { IAuthService } from "../../src/contracts/usecases/IAuthService"
import { NotificationService } from "../../src/usecases/notification/NotificationService"
import { INotificationService } from "../../src/contracts/usecases/INotificationService"
import { AuthService } from "../../src/usecases/auth/AuthService"
import { OperationStatus } from "../../src/constants/operations"
import { AuthGuard } from "../../src/middleware/AuthGuard"
import { UserRoles } from "../../src/contracts/middleware/AuthGuard"
import { Database } from "../../src/database/db"
import { IJWTUtil } from "../../src/contracts/utils/IJWTUtil"
import { JWTUtil } from "../../src/utils/JWTUtil"
import { IUserRepository } from "../../src/contracts/repositories/IUserRepository"
import { UserRepository } from "../../src/repositories/UserRepository"
import { IHashUtil } from "../../src/contracts/utils/IHashUtil"
import { HashUtil } from "../../src/utils/HashUtil"
import { ICloudMessagingService } from "../../src/contracts/usecases/ICloudMessagingService"
import { StorageService } from "../../src/usecases/storage/StorageService"
import { IStorageService } from "../../src/contracts/usecases/IStorageServices"
import { IEmailService } from "../../src/contracts/usecases/IEmailService"
import { EmailService } from "../../src/usecases/email/EmailService"

dotenv.config()

let db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!
)

let userRepo: IUserRepository
let authService: IAuthService
let notificationService: INotificationService
let jwtUtil: IJWTUtil
let hashUtil: IHashUtil
let notifRepo: INotificationRepositories
let cloudMessageService: ICloudMessagingService
let cloudStorageService: IStorageService
let emailService: IEmailService

beforeAll(async () => {
  //Instantiate services
  userRepo = new UserRepository()
  jwtUtil = new JWTUtil()
  hashUtil = new HashUtil()
  emailService = new EmailService(
    "smtp.gmail.com",
    587,
    "smartcubeppi@gmail.com",
    "ispt ujxo avvo hpoz",
    "smartcubeppi@gmail.com"
  )
  notificationService = new NotificationService(
    userRepo,
    notifRepo,
    cloudMessageService,
    cloudStorageService,
    emailService
  )
  authService = new AuthService(
    userRepo,
    jwtUtil,
    hashUtil,
    notificationService
  )

  //Connect db
  await db.connect()

  //create dummy user with id 1
  await db.getConnection().query(
    "INSERT INTO users (id, username, email, password, reset_token, is_verified, verification_code, created_at) VALUES (10000, 'iyan', 'iyan@mail.com', '$2b$10$hT.yOgwP5SA3OuEKHQY1W.qpe7U1DOxAI3LcLuOt.SwJ7Hjvfv4cO', 'resettoken123', 0, '123456', '2023-09-11')"
  )
})

afterAll(async () => {
  await db.getConnection().query("DELETE FROM users WHERE id = 10000")
  await db.getConnection().query("DELETE FROM users WHERE username = 'pras'")
})

describe("login", () => {
  it("failed to login due to wrong email", async () => {
    const email = "wrong@mail.com"
    const password = "pass123"

    const res = await authService.login(email, password)

    //assert
    // console.log(res)
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.authInvalidCredential)
  })

  it("failed to login due to wrong password", async () => {
    const email = "iyan@mail.com"
    const password = "pass12345"

    const res = await authService.login(email, password)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.authInvalidCredential)
  })

  it("failed to login due to unverified", async () => {
    const email = "iyan@mail.com"
    const password = "pass12345"

    const res = await authService.login(email, password)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.authInvalidCredential)
  })

  it("Login success", async () => {
    const email = "iyan@mail.com"
    const password = "pass123"
    
    await db.getConnection().query(
      "UPDATE users SET is_verified=1 WHERE id=10000"
    )

    const res = await authService.login(email, password)

    //assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})

describe("sign up", () => {
  it("failed to sign up due to email already exist", async () => {
    const username = "iyan"
    const email = "iyan@mail.com"
    const password = "pass123"
    const cPassword = "pass123"
    const fcmRegistrationToken = "123123"


    const res = await authService.signUp(username, email, password, cPassword, fcmRegistrationToken)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelExist)
  })

  it("failed to sign up due to password and confirm password doesn't match", async () => {
    const username = "iyan"
    const email = "iyan2@mail.com"
    const password = "pass123"
    const cPassword = "pass1232"
    const fcmRegistrationToken = "123123"


    const res = await authService.signUp(username, email, password, cPassword, fcmRegistrationToken)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.signUpErrorInvalidData)
  })

  it("sign up success", async () => {
    const username = "pras"
    const email = "pras@mail.com"
    const password = "pass123"
    const cPassword = "pass123"
    const fcmRegistrationToken = "123123"

    const res = await authService.signUp(username, email, password, cPassword, fcmRegistrationToken)

    //assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})

describe("verification code", () => {

  it("verification code does match", async () => {
    const email = "iyan@mail.com"
    const verificationCode = "123456"

    const res = await authService.checkVerificationCode(email, verificationCode)

    // assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })

  it("verification code does not match", async () => {
    const email = "iyan@mail.com"
    const verificationCode = "666666"

    const res = await authService.checkVerificationCode(email, verificationCode)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.verificationCodeInvalid)
  })
})

describe("reset password request", () => {
  it("reset password request failed due to wrong email", async () => {
    const email = "wrong@mail.com"

    const res = await authService.resetPasswordRequest(email)

    // assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.authInvalidCredential)
  })

  it("reset password request successfully sent", async () => {
    const email = "iyan@mail.com"

    const res = await authService.resetPasswordRequest(email)
    // assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  }, 6000)
})

describe("reset password", () => {
  it("reset password failed with invalid reset token format", async () => {

    const res = await authService.resetPassword("resettoken123", "wakwaw123", "wakwaw123")

    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.authInvalidCredential)

  })

  it("reset password failed with invalid cPassword", async () => {

    const user = await db.getConnection().query("SELECT * FROM users WHERE id = 10000")

    // console.log(user[0][0])
    const userData = user[0][0] as any
    const res = await authService.resetPassword(userData.reset_token, "wakwaw124", "wakwaw123")

    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.authInvalidCredential)
  })

  it("reset password success", async () => {

    const user = await db.getConnection().query("SELECT * FROM users WHERE id = 10000")

    // console.log(user[0][0])
    const userData = user[0][0] as any
    const res = await authService.resetPassword(userData.reset_token, "wakwaw123", "wakwaw123")

    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})

