import dotenv from "dotenv";
import assert from "assert";
import fs from "fs";

import { NotificationRepository } from "../../src/repositories/NotificationRepository";
import { INotificationRepositories } from "../../src/contracts/repositories/INotificationRepositories";
import { IUserRepository } from '../../src/contracts/repositories/IUserRepository';
import { UserRepository } from '../../src/repositories/UserRepository';
import { CloudMessagingService } from "../../src/usecases/cloudMessage/CloudMessagingService";
import { ICloudMessagingService } from "../../src/contracts/usecases/ICloudMessagingService";
import { StorageService } from "../../src/usecases/storage/StorageService";
import { IStorageService } from "../../src/contracts/usecases/IStorageServices";
import { NotificationService } from "../../src/usecases/notification/NotificationService";
import { INotificationService } from "../../src/contracts/usecases/INotificationService";
import { IUploadedFile } from "../../src/contracts/IFile";
import { OperationStatus } from "../../src/constants/operations";
import { AuthGuard } from "../../src/middleware/AuthGuard";
import { UserRoles } from "../../src/contracts/middleware/AuthGuard";
import { Database } from "../../src/database/db";
import { IEmailService } from '../../src/contracts/usecases/IEmailService'
import { EmailService } from '../../src/usecases/email/EmailService'



dotenv.config();

let db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!,
)

let userRepository: IUserRepository
let notificationRepository: INotificationRepositories;
let cloudStorageService: IStorageService;
let cloudMessageService: ICloudMessagingService;
let notificationService: INotificationService;
let emailService: IEmailService

beforeAll(async () => {

  //Connect db
  await db.connect()

  //create dummy data user, notification, devices, and user_groups with id 10013
  try {
    await db.getConnection().query("INSERT INTO users (id, username, email, password, created_at) VALUES " +
    "(10013, 'iyan', 'iyan@mail.com', 'pass123', '2023-09-09'), " + 
    "(10004, 'ucok', 'ucok@mail.com', 'pass123', '2023-09-09'), " + 
    "(10005, 'udin', 'udin@mail.com', 'pass123', '2023-09-09'), " +
    "(10006, 'budi', 'budi@mail.com', 'pass123', '2023-09-09') "
    )
   
    await db.getConnection().query("INSERT INTO edge_servers (id, name, vendor, description, mqtt_user, mqtt_password, mqtt_pub_topic, mqtt_sub_topic) VALUES (10013, 'NUC 1001', 'INTEL', 'desc exmaple', 'user1', 'pass1', 'pub-topic-1', 'sub-topic-1')")
   
    await db.getConnection().query("INSERT INTO user_groups (id, user_id, edge_server_id, role_id) VALUES " +
    "(10013, 10013, 10013, 1)," +
    "(10004, 10004, 10013, 1)," +
    "(10005, 10005, 10013, 2)"
    )
  
    await db.getConnection().query("INSERT INTO notifications (id, user_id, edge_server_id, device_id, device_type, object_label, risk_level, title, image, description, is_viewed, created_at, updated_at) VALUES " +
      `(10013, 10013,  10013, 10013, 'camera', 'fire', 'high risk', 'title 1', 'image 1', 'description 1', 0, '2023-09-09', '2023-09-09')`)
 
  } catch (error) {
    console.log(error)
    throw error
  }

  //Instantiate services
  userRepository = new UserRepository()
  notificationRepository = new NotificationRepository();
  cloudStorageService = new StorageService();
  cloudMessageService = new CloudMessagingService();
  const emailService = new EmailService(
    process.env.SMTP_HOST!,
    Number(process.env.SMTP_PORT!),
    process.env.SMTP_USER!,
    process.env.SMTP_USER_PASSWORD!,
    process.env.SENDER_EMAIL!
  )
  notificationService = new NotificationService(
    userRepository,
    notificationRepository,
    cloudMessageService,
    cloudStorageService,
    emailService
  );
});

afterAll(async () => {
  try {
    await db.getConnection().query('DELETE FROM notifications WHERE user_id = 10013')
    await db.getConnection().query('DELETE FROM user_groups WHERE edge_server_id = 10013')
    await db.getConnection().query('DELETE FROM edge_servers WHERE id = 10013')
    await db.getConnection().query('DELETE FROM users WHERE id IN (10013, 10004, 10005, 10006)')
  } catch (error) {
    console.log(error)
    throw error
  }
})


const filePath = process.cwd() + "/tests/images/img1.png";
const buffer = fs.readFileSync(filePath);
const file: IUploadedFile = {
  buffer: buffer,
  originalname: "img1.png",
  mimetype: "image/png",
};

let storedNotificationID = 0


describe("store", () => {

  it("Store failed with user id invalid", async () => {

    //create auth guard
    const authGuard = new AuthGuard(10013, "iyan2@mail.com", "iyan", UserRoles.Admin, 10013); //User with id 0 is invalid or not exists

    //execute usecase
    const resp = await notificationService.storeNotification(
      authGuard,
      file,
      1003,
      "camera",
      "fire",
      "high risk",
      "terdeteksi api",
      "desc"
    );

    // console.log(resp)

    //assert
    assert.equal(resp.getStatus(), false);
    assert.equal(OperationStatus.repoErrorModelNotFound, resp.getStatusCode());

  });

  it("Store failed with invalid edge token", async () => {

    //create auth guard
    const authGuard = new AuthGuard(10013, "iyan@mail.com", "iyan", UserRoles.Admin, undefined); //User with id 0 is invalid or not exists

    //execute usecase
    const resp = await notificationService.storeNotification(
      authGuard,
      file,
      1003,
      "camera",
      "fire",
      "high risk",
      "terdeteksi api",
      "desc"
    );

    // console.log(resp)

    //assert
    assert.equal(resp.getStatus(), false);
    assert.equal(OperationStatus.invalidEdgeToken, resp.getStatusCode());

  });


  it("Store success", async () => {

    //create auth guard
    const authGuard = new AuthGuard(10013, "iyan@mail.com", "iyan", UserRoles.Admin, 10013);

    //execute usecase
    const res = await notificationService.storeNotification(
      authGuard,
      file,
      1003,
      "camera",
      "fire",
      "high risk",
      "terdeteksi api",
      "desc"
    );

    // console.log(res)
    //assert
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);

    storedNotificationID = res.getData().id

  });
});

describe("view notification", () => {

  it("failed unauthorized", async () => {
    const authGuard = new AuthGuard(0, "", "", UserRoles.Admin, 10013);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID, 10013);

    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });

  it("success", async () => {
    const authGuard = new AuthGuard(10013, "", "", UserRoles.Admin, 10013);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID, 10013);

    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("success by member of the group", async () => {
    const authGuard = new AuthGuard(10004, "", "", UserRoles.Admin, 10013);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID, 10013);

    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  
});

describe("fetch all", () => {

  it("success fetch by the owner", async () => {
    const authGuard = new AuthGuard(10013, "", "", UserRoles.Admin, 10013);

    const res = await notificationService.fetchAllNotification(authGuard);

    // console.log(res)
    assert.ok(res.getStatus());
    assert.equal(res.getData().length, 2)
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("success fetch by user ucok", async () => {
    const authGuard = new AuthGuard(10004, "", "", UserRoles.Admin, 10013);

    const res = await notificationService.fetchAllNotification(authGuard);

    // console.log(res)
    assert.ok(res.getStatus());
    assert.equal(res.getData().length, 2)
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("success fetch by user udin", async () => {
    const authGuard = new AuthGuard(10005, "", "", UserRoles.Member, 10013);

    const res = await notificationService.fetchAllNotification(authGuard);

    // console.log(res)
    assert.ok(res.getStatus());
    assert.equal(res.getData().length, 2)
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("empty data due to user did not join user group with edge server id = 10013", async () => {
    const authGuard = new AuthGuard(10006, "", "", UserRoles.Member, 10013);

    const res = await notificationService.fetchAllNotification(authGuard);

    // console.log(res)
    assert.ok(res.getStatus());
    assert.equal(res.getData().length, 0)
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

})

describe("delete notification", () => {
  const authGuard = new AuthGuard(10013, "iyan@gmail.com", "iyan", UserRoles.Admin, 10013);

  it("failed unauthorized", async () => {
    //delete notif
    const authGuard2 = new AuthGuard(999999, "", "", UserRoles.Admin, 10013);
    const res = await notificationService.deleteNotification(
      authGuard2,
      storedNotificationID,
      10013,
    );

    //assert
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });

  it("failed unauthorized due to member doesn't have admin role", async () => {
    //delete notif
    const authGuard2 = new AuthGuard(10005, "", "", UserRoles.Member, 10013);
    const res = await notificationService.deleteNotification(
      authGuard2,
      storedNotificationID,
      10013,
    );

    //assert
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });

  it("failed model not found", async () => {
    //delete notif
    const res = await notificationService.deleteNotification(authGuard, 0, 10013);

    //assert
    // console.log(res)
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound);
  });

  it("success", async () => {
    //delete notif
    const res = await notificationService.deleteNotification(
      authGuard,
      storedNotificationID,
      10013
    );
    // console.log(res);

    //assert
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

});
