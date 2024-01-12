import dotenv from "dotenv";
import assert from "assert";
import fs from "fs";

import { StorageService } from "../../src/usecases/storage/StorageService";
import { IStorageService } from "../../src/contracts/usecases/IStorageServices";
import { IUploadedFile } from "../../src/contracts/IFile";
import { OperationStatus } from "../../src/constants/operations";

dotenv.config();

let cloudStorageService: IStorageService;
beforeAll(async () => {
  cloudStorageService = new StorageService();
});

const fileName = "nama-file.txt";
const fileType = "text/plain";

const filePath = process.cwd() + "/tests/textfile/testFiles.txt";
const buffer = fs.readFileSync(filePath);

const file: IUploadedFile = {
  buffer: buffer,
  originalname: fileName,
  mimetype: fileType,
};

let fileUrl = "";

describe("upload file", () => {
  it("upload file success", async () => {
    const res = await cloudStorageService.uploadFile(file);

    fileUrl = res.getData().fileUrl;

    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  }, 10000);

  //   it("upload file failed", async () => {
  //     const fileName = "nama-file.txt";
  //     const fileType = "text/plain";

  //     const filePath = process.cwd() + "/tests/textfile/testFiles.txt";
  //     const buffer = fs.readFileSync(filePath);

  //     const file: IUploadedFile = {
  //       buffer: buffer,
  //       originalname: fileName,
  //       mimetype: fileType,
  //     };

  //     const res = await cloudStorageService.uploadFile(file);

  //     assert.equal(res.getStatus(), false);
  //     assert.equal(res.getStatusCode(), OperationStatus.cloudStorageError);
  //   });
});

describe("delete file", () => {
  it("file deleted successfully", async () => {
    const res = await cloudStorageService.deleteFile(fileUrl);

    // console.log(res.getMessage())
    assert.ok(res.getStatus());
    assert.equal(res.getStatus(), OperationStatus.success);
  });
});

