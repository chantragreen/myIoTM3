import mqtt, { type IClientOptions, type MqttClient } from "mqtt";

declare global {
  var __aiotMqttClient: MqttClient | undefined;
}

export interface PublishResult {
  mode: "demo" | "broker";
  topic: string;
  payload: string;
  clientId: string;
  message: string;
}

function getBrokerUrl() {
  return process.env.MQTT_BROKER_URL?.trim();
}

function getClientOptions(): IClientOptions {
  return {
    clientId:
      process.env.MQTT_CLIENT_ID?.trim() ?? `aiot-hub-${Math.random().toString(16).slice(2, 10)}`,
    username: process.env.MQTT_USERNAME?.trim(),
    password: process.env.MQTT_PASSWORD?.trim(),
    reconnectPeriod: 2_000,
    connectTimeout: 4_000,
  };
}

function getClient() {
  const brokerUrl = getBrokerUrl();

  if (!brokerUrl) {
    throw new Error("MQTT_BROKER_URL is not configured");
  }

  if (!global.__aiotMqttClient) {
    global.__aiotMqttClient = mqtt.connect(brokerUrl, getClientOptions());
  }

  return global.__aiotMqttClient;
}

function ensureConnected(client: MqttClient) {
  if (client.connected) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while connecting to MQTT broker"));
    }, 4_000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      client.off("connect", handleConnect);
      client.off("error", handleError);
    };

    const handleConnect = () => {
      cleanup();
      resolve();
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    client.on("connect", handleConnect);
    client.on("error", handleError);
  });
}

export async function publishMqttMessage(topic: string, payload: string): Promise<PublishResult> {
  if (!getBrokerUrl() || process.env.MQTT_DEMO_MODE === "true") {
    return {
      mode: "demo",
      topic,
      payload,
      clientId: "demo-simulator",
      message: "Message simulated locally because MQTT demo mode is enabled.",
    };
  }

  const client = getClient();
  await ensureConnected(client);

  await new Promise<void>((resolve, reject) => {
    client.publish(topic, payload, { qos: 0 }, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return {
    mode: "broker",
    topic,
    payload,
    clientId: client.options.clientId ?? "aiot-hub-client",
    message: "Message published to the configured MQTT broker.",
  };
}