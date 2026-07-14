export type DeviceType = "ESP32" | "Raspberry Pi" | "Vision Camera";
export type DeviceStatus = "online" | "warning" | "offline";
export type RuleStatus = "armed" | "draft";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  macAddress: string;
  location: string;
  topic: string;
  lastSeen: string;
}

export interface SensorSample {
  timestamp: string;
  temperature: number;
  humidity: number;
  power: number;
  occupancy: number;
}

export interface VisionEvent {
  id: string;
  camera: string;
  confidence: number;
  label: string;
  timestamp: string;
}

export interface AiRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  targetTopic: string;
  status: RuleStatus;
}

export interface CommandLog {
  id: string;
  topic: string;
  payload: string;
  transport: string;
  result: "sent" | "error";
  timestamp: string;
}

export const initialDevices: Device[] = [
  {
    id: "esp32-greenhouse",
    name: "Greenhouse Cluster A",
    type: "ESP32",
    status: "online",
    macAddress: "AA:01:BC:22:19:F4",
    location: "Sensor bench 1",
    topic: "/team-alpha/esp32/greenhouse",
    lastSeen: "10 sec ago",
  },
  {
    id: "pi-vision-lab",
    name: "Vision Lab Node",
    type: "Raspberry Pi",
    status: "online",
    macAddress: "AA:01:BC:22:44:C2",
    location: "Camera rig zone",
    topic: "/team-alpha/pi/vision",
    lastSeen: "26 sec ago",
  },
  {
    id: "cam-entry-lane",
    name: "Entry Camera",
    type: "Vision Camera",
    status: "warning",
    macAddress: "AA:01:BC:22:77:EE",
    location: "Front entrance",
    topic: "/team-alpha/camera/entry",
    lastSeen: "1 min ago",
  },
  {
    id: "esp32-relay-rack",
    name: "Relay Control Rack",
    type: "ESP32",
    status: "offline",
    macAddress: "AA:01:BC:22:88:10",
    location: "Power cabinet",
    topic: "/team-alpha/esp32/relay-rack",
    lastSeen: "9 min ago",
  },
];

export const initialRules: AiRule[] = [
  {
    id: "rule-human-presence",
    name: "Human presence relay",
    condition: "If occupancy > 70% and face detected",
    action: 'Publish "ON"',
    targetTopic: "/team-alpha/relay/1",
    status: "armed",
  },
  {
    id: "rule-temp-cooldown",
    name: "Greenhouse cooldown",
    condition: "If temperature > 30 C",
    action: 'Publish "FAN_ON"',
    targetTopic: "/team-alpha/hvac/fan",
    status: "armed",
  },
  {
    id: "rule-camera-review",
    name: "Low confidence review",
    condition: "If confidence < 60%",
    action: "Send REST webhook",
    targetTopic: "/team-alpha/review/camera",
    status: "draft",
  },
];