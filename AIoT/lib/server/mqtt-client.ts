import mqtt, { MqttClient } from "mqtt";
import { EventEmitter } from "node:events";

interface MqttPayload {
  topic: string;
  message: string;
  receivedAt: string;
}

class MqttService {
  private client: MqttClient | null = null;

  private emitter = new EventEmitter();

  private connected = false;

  connect() {
    if (this.client) {
      return this.client;
    }

    const brokerUrl = process.env.MQTT_URL || "mqtt://172.16.3.205:1883";

    this.client = mqtt.connect(brokerUrl, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 2000,
      connectTimeout: 10_000
    });

    this.client.on("connect", () => {
      this.connected = true;
    });

    this.client.on("close", () => {
      this.connected = false;
    });

    this.client.on("error", () => {
      this.connected = false;
    });

    this.client.on("message", (topic, payload) => {
      this.emitter.emit("message", {
        topic,
        message: payload.toString(),
        receivedAt: new Date().toISOString()
      } satisfies MqttPayload);
    });

    return this.client;
  }

  subscribe(topic: string) {
    const client = this.connect();
    client.subscribe(topic);
  }

  publish(topic: string, message: string, qos: 0 | 1 | 2 = 0, retain = false) {
    const client = this.connect();

    client.publish(topic, message, {
      qos,
      retain
    });
  }

  onMessage(listener: (payload: MqttPayload) => void) {
    this.emitter.on("message", listener);
    return () => this.emitter.off("message", listener);
  }

  status() {
    return {
      connected: this.connected,
      broker: process.env.MQTT_URL || "mqtt://172.16.3.205:1883"
    };
  }
}

const globalForMqtt = globalThis as unknown as {
  mqttService?: MqttService;
};

export const mqttService = globalForMqtt.mqttService ?? new MqttService();
if (!globalForMqtt.mqttService) {
  globalForMqtt.mqttService = mqttService;
}
