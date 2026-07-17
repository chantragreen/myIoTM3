import { mqttService } from "@/lib/server/mqtt-client";

type DeviceStatus = "online" | "offline";

interface PresenceState {
  teamId: string;
  deviceId: string;
  macAddress: string;
  lastSeenAt: number;
  status: DeviceStatus;
  topics: Set<string>;
}

export interface PresenceSnapshot {
  teamId: string;
  deviceId: string;
  macAddress: string;
  lastSeen: string;
  status: DeviceStatus;
  topics: string[];
}

const state = new Map<string, PresenceState>();
let trackerStarted = false;

const DEVICE_TIMEOUT_MS = 60_000;

const getKey = (teamId: string, deviceId: string) => `${teamId}:${deviceId}`;

const getOrCreateState = (teamId: string, deviceId: string) => {
  const key = getKey(teamId, deviceId);
  const existing = state.get(key);
  if (existing) {
    return existing;
  }

  const created: PresenceState = {
    teamId,
    deviceId,
    macAddress: "",
    lastSeenAt: Date.now(),
    status: "offline",
    topics: new Set<string>()
  };
  state.set(key, created);
  return created;
};

const updateStatusByTimeout = (device: PresenceState, timeoutMs: number) => {
  if (Date.now() - device.lastSeenAt > timeoutMs) {
    device.status = "offline";
  }
};

const parseTopic = (topic: string) => {
  const parts = topic.split("/");
  if (parts.length < 4 || parts[0] !== "team") {
    return null;
  }

  return {
    teamId: parts[1],
    deviceId: parts[2],
    metric: parts[3]
  };
};

const toSnapshot = (device: PresenceState): PresenceSnapshot => ({
  teamId: device.teamId,
  deviceId: device.deviceId,
  macAddress: device.macAddress,
  lastSeen: new Date(device.lastSeenAt).toISOString(),
  status: device.status,
  topics: Array.from(device.topics.values()).sort()
});

const onMessage = (topic: string, message: string) => {
  const parsedTopic = parseTopic(topic);
  if (!parsedTopic) {
    return;
  }

  const { teamId, deviceId, metric } = parsedTopic;
  const device = getOrCreateState(teamId, deviceId);
  device.topics.add(topic);

  if (metric === "heartbeat") {
    device.lastSeenAt = Date.now();
    device.status = "online";

    try {
      const payload = JSON.parse(message) as { mac?: unknown };
      if (typeof payload.mac === "string" && payload.mac.trim()) {
        device.macAddress = payload.mac.trim().toUpperCase();
      }
    } catch {
      // Ignore malformed heartbeat payloads and keep presence state.
    }

    return;
  }

  if (metric === "status") {
    try {
      const payload = JSON.parse(message) as { online?: unknown };
      if (typeof payload.online === "boolean") {
        device.status = payload.online ? "online" : "offline";
      }
    } catch {
      // Ignore malformed status payloads and keep default status behavior.
    }

    return;
  }

  if (metric === "temperature" || metric === "humidity" || metric === "light") {
    device.status = "online";
  }
};

export const ensurePresenceTracking = () => {
  if (trackerStarted) {
    return;
  }

  trackerStarted = true;
  mqttService.connect();
  mqttService.subscribe("team/+/+/+");
  mqttService.onMessage((payload) => {
    onMessage(payload.topic, payload.message);
  });
};

export const getTeamPresence = (teamId: string, timeoutMs = DEVICE_TIMEOUT_MS) => {
  ensurePresenceTracking();

  const snapshots: PresenceSnapshot[] = [];
  for (const device of state.values()) {
    if (device.teamId !== teamId) {
      continue;
    }

    updateStatusByTimeout(device, timeoutMs);
    snapshots.push(toSnapshot(device));
  }

  return snapshots.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
};
