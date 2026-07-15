import { randomUUID } from "node:crypto";
import { CreateDeviceInput, Device } from "@/types/device";

const registry = new Map<string, Device[]>();

const buildTopics = (teamId: string, deviceId: string, type: Device["type"]) => {
  const base = `team/${teamId}/${deviceId}`;

  if (type === "sensor") {
    return [`${base}/temperature`, `${base}/humidity`, `${base}/light`];
  }

  if (type === "actuator") {
    return [`${base}/relay/1/cmd`, `${base}/relay/1/state`];
  }

  return [`${base}/heartbeat`, `${base}/status`];
};

const seed = () => {
  if (registry.size > 0) {
    return;
  }

  const now = new Date().toISOString();
  const teamId = "TEAM-DEMO";
  const edgeId = randomUUID();

  registry.set(teamId, [
    {
      id: edgeId,
      teamId,
      name: "Pico W Edge #01",
      type: "edge-station",
      macAddress: "28:CD:C1:10:AF:EE",
      topics: buildTopics(teamId, edgeId, "edge-station"),
      status: "online",
      lastSeen: now,
      createdAt: now
    }
  ]);
};

seed();

export const listDevices = (teamId: string) => {
  return registry.get(teamId) ?? [];
};

export const createDevice = (teamId: string, input: CreateDeviceInput) => {
  const deviceId = randomUUID();
  const now = new Date().toISOString();

  const record: Device = {
    id: deviceId,
    teamId,
    name: input.name,
    type: input.type,
    macAddress: input.macAddress.toUpperCase(),
    topics: buildTopics(teamId, deviceId, input.type),
    status: "online",
    lastSeen: now,
    createdAt: now
  };

  const current = registry.get(teamId) ?? [];
  registry.set(teamId, [record, ...current]);

  return record;
};

export const deleteDevice = (deviceId: string) => {
  for (const [teamId, devices] of registry.entries()) {
    const next = devices.filter((device) => device.id !== deviceId);

    if (next.length !== devices.length) {
      registry.set(teamId, next);
      return true;
    }
  }

  return false;
};
