export interface IResponse {
    status: boolean,
    statusCode: number,
    message: string,
    data: any,
    
    getStatus(): boolean
    getStatusCode(): number
    getMessage(): string
    getData(): any

    setStatus(status: boolean): IResponse
    setStatusCode(statusCode: number): IResponse
    setMessage(message: string): IResponse
    setData(data: any): IResponse
    
    isFailed(): boolean
}