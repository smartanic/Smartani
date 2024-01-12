import { IUploadedFile } from "../IFile";
import { IResponse } from "./IResponse";

export interface IStorageService {
    uploadFile(file: IUploadedFile): Promise<IResponse>
    deleteFile(fileUrl: string): Promise<IResponse>
}
