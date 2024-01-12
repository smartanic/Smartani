import { IResponse } from "@/contracts/usecases/IResponse";
import { IMQTTService } from "@/contracts/usecases/IMQTTService";
import { Response } from "../../utils/Response";
import { OperationStatus } from "../../constants/operations";
import { MqttClient, connect } from "mqtt";
import fs from "fs"

export class MQTTService implements IMQTTService {

    client!: MqttClient;

    private protocol: string | undefined;
    private host: string | undefined;
    private port: string | undefined;
    private caPath: string | undefined;
    private username: string | undefined;
    private password: string | undefined;

    constructor(
        protocol: string,
        host: string,
        port: string,
        caPath: string,
        username: string,
        password: string
    ) {
        this.protocol = protocol
        this.host = host
        this.port = port
        this.caPath = caPath
        this.username = username
        this.password = password
    }

    async connect(): Promise<IResponse> {

        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

        const connectUrl = `${this.protocol}://${this.host}:${this.port}`

        this.client = connect(connectUrl, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            username: this.username,
            password: this.password,
            reconnectPeriod: 1000,
            ca: this.caPath != undefined ? fs.readFileSync(this.caPath) : undefined
        })

        this.client.on('connect', () => {
            console.log('MQTT Connected')
        })

        return new Response()
            .setStatus(true)
            .setStatusCode(OperationStatus.success)
            .setMessage("ok")
            .setData({})
    }

    async publish(topic: string, payload: string): Promise<IResponse> {

        try {
            
            this.client.publish(topic, payload);

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(null)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.mqttPublishError)
                .setMessage(error)
                .setData(null)
        }
    }

    async subscribe(topic: string, payload: string): Promise<IResponse> {

        this.client.subscribe([topic], () => {
            console.log(`Subscribe to topic '${topic}'`)
        })

        this.client.on('message', (topic, payload) => {
            console.log('Received Message:', topic, payload)
        })

        return new Response()
            .setStatus(true)
            .setStatusCode(OperationStatus.success)
            .setMessage("ok")
            .setData({})
    }

}