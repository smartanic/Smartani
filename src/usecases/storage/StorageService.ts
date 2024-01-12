import { IResponse } from "@/contracts/usecases/IResponse"
import { IStorageService } from "@/contracts/usecases/IStorageServices"
import { Response } from "../../utils/Response"
import { IUploadedFile } from "@/contracts/IFile"
import { Storage } from "@google-cloud/storage"
import { OperationStatus } from "../../constants/operations"
import "dotenv/config"

export class StorageService implements IStorageService {
  private storage: Storage
  private bucketName: string

  constructor() {
    this.storage = new Storage() 
    this.bucketName = `${process.env.BUCKET_NAME}`
  }

  async uploadFile(file: IUploadedFile): Promise<IResponse> {
    try {
      await this.storage
        .bucket(this.bucketName)
        .file(file.originalname)
        .save(file.buffer)

      console.log(`${file.originalname} uploaded to ${this.bucketName}`)

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData({
          fileUrl: `https://storage.googleapis.com/${this.bucketName}/${file.originalname}`,
          fileName: file.originalname,
          bucketName: this.bucketName,
        })
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.cloudStorageError)
        .setMessage(error)
        .setData({})
    }
  }

  async deleteFile(fileUrl: string): Promise<IResponse> {
    const bucketData = fileUrl.split("/")

    const fileName = bucketData[4]

    try {
      await this.storage.bucket(this.bucketName).file(fileName).delete()
      console.log(`${fileUrl} deleted`)

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData({ fileName: fileName, bucketName: this.bucketName })
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.cloudStorageError)
        .setMessage(error)
        .setData({})
    }
  }
}
