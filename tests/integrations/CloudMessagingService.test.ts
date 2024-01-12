import assert from 'assert'
import { CloudMessagingService } from '../../src/usecases/cloudMessage/CloudMessagingService'
import { ICloudMessagingService } from '../../src/contracts/usecases/ICloudMessagingService'
import dotenv from 'dotenv'

dotenv.config()

let cloudMessageService: ICloudMessagingService;

beforeAll(() => {
    cloudMessageService = new CloudMessagingService()
})

describe("test cloud message connection", () => {
    it("success connected", () => {
        assert.ok(cloudMessageService.isServiceConnected())
    })

    it("send notification success", async () => {
        let res = await cloudMessageService.sendNotification(["your_registration_token"], "title test", "desc test", "https://image/1.jpg", "100", 1000, "camera")
        
        // console.log(res.getMessage()[0])
        
        assert.ok(res.getStatus())
    })
})
