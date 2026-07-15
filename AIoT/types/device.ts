export type DeviceType = "sensor" | "actuator" | "edge-station";

export type DeviceStatus = "online" | "offline";

export interface Device {
  id: string;
  teamId: string;
  name: string;
  type: DeviceType;
  macAddress: string;
  topics: string[];
  status: DeviceStatus;
  lastSeen: string;
  createdAt: string;
}

export interface CreateDeviceInput {
  name: string;
  type: DeviceType;
  macAddress: string;
}
