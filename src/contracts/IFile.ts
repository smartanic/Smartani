import { Buffer } from "buffer";
import { Readable } from 'stream';

export interface IUploadedFile {
    buffer: Buffer; // Buffer containing file data
    originalname: string; // Original name of the file
    mimetype: string; // MIME type of the file
}

export interface IUploadedStreamFile {
  stream: Readable; // Readable stream for the file
  originalname: string; // Original name of the file
  mimetype: string; // MIME type of the file
}