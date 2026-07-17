import { randomUUID } from "node:crypto";
import { CreateDeviceInput, Device } from "@/types/device";
import { getTeamPresence } from "@/lib/server/mqtt-presence";

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

const extractDeviceId = (teamId: string, topics: string[]) => {
  for (const topic of topics) {
    const parts = topic.split("/");
    if (parts.length >= 3 && parts[0] === "team" && parts[1] === teamId) {
      return parts[2];
    }
  }

  return null;
};

export const listDevices = (teamId: string) => {
  const savedDevices = registry.get(teamId) ?? [];
  const presenceDevices = getTeamPresence(teamId, 60_000);
  const presenceByDeviceId = new Map(presenceDevices.map((device) => [device.deviceId, device]));

  const mergedSaved = savedDevices.map((device) => {
    const sourceDeviceId = extractDeviceId(teamId, device.topics);
    const presence = sourceDeviceId ? presenceByDeviceId.get(sourceDeviceId) : undefined;

    if (!presence) {
      return {
        ...device,
        status: "offline" as const
      };
    }

    return {
      ...device,
      status: presence.status,
      lastSeen: presence.lastSeen,
      macAddress: presence.macAddress || device.macAddress,
      topics: presence.topics.length > 0 ? presence.topics : device.topics
    };
  });

  const mergedSavedDeviceIds = new Set(
    mergedSaved
      .map((device) => extractDeviceId(teamId, device.topics))
      .filter((value): value is string => Boolean(value))
  );

  const discovered = presenceDevices
    .filter((device) => !mergedSavedDeviceIds.has(device.deviceId))
    .map(
      (device): Device => ({
        id: `mqtt:${teamId}:${device.deviceId}`,
        teamId,
        name: `Pico ${device.deviceId}`,
        type: "edge-station",
        macAddress: device.macAddress || "UNKNOWN",
        topics: device.topics,
        status: device.status,
        lastSeen: device.lastSeen,
        createdAt: device.lastSeen
      })
    );

  return [...discovered, ...mergedSaved];
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
