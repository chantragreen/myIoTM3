"use client";

import { useEffect, useMemo, useState } from "react";
import { TelemetrySeriesPoint } from "@/types/telemetry";

const MAX_POINTS = 40;
const HEARTBEAT_TIMEOUT_MS = 60_000;

const toDisplayTime = (isoLike?: string) => {
  const timestamp = isoLike ? new Date(isoLike) : new Date();
  if (Number.isNaN(timestamp.getTime())) {
    return new Date().toLocaleTimeString("th-TH", { hour12: false });
  }

  return timestamp.toLocaleTimeString("th-TH", { hour12: false });
};

const parseTopic = (topic: string) => {
  const parts = topic.split("/");
  if (parts.length < 4 || parts[0] !== "team") {
    return null;
  }

  if (parts[1] === "+" || parts[2] === "+" || parts[3] === "+") {
    return null;
  }

  return {
    teamId: parts[1],
    deviceId: parts[2],
    metric: parts[3]
  };
};

const buildDefaultSeriesPoint = () => ({
  time: toDisplayTime(),
  temperature: 0,
  humidity: 0,
  light: 0
});

interface MqttStreamPayload {
  topic: string;
  message: string;
  receivedAt?: string;
}

interface DeviceRealtimeState {
  temperature?: number;
  humidity?: number;
  light?: number;
  buttonState?: string;
  lastHeartbeatAt?: number;
  online?: boolean;
}

interface ListedDevice {
  id: string;
  status: "online" | "offline";
  lastSeen: string;
  topics: string[];
}

const extractDeviceIdFromTopics = (teamId: string, topics: string[]) => {
  for (const topic of topics) {
    const parsed = parseTopic(topic);
    if (parsed && parsed.teamId === teamId) {
      return parsed.deviceId;
    }
  }

  return null;
};

const extractDeviceIdFromRowId = (id: string, teamId: string) => {
  const prefix = `mqtt:${teamId}:`;
  if (id.startsWith(prefix)) {
    return id.slice(prefix.length);
  }

  return null;
};

export function useRealtimeTelemetry(teamId: string, selectedDeviceId?: string) {
  const [seriesByDevice, setSeriesByDevice] = useState<Record<string, TelemetrySeriesPoint[]>>({});
  const [devices, setDevices] = useState<Record<string, DeviceRealtimeState>>({});

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const bootstrapDevices = async () => {
      try {
        const response = await fetch(`/api/devices?teamId=${encodeURIComponent(teamId)}`, {
          cache: "no-store"
        });
        if (!response.ok) {
          return;
        }

        const listedDevices = (await response.json()) as ListedDevice[];
        setDevices((prev) => {
          const next = { ...prev };

          for (const row of listedDevices) {
            const byTopics = extractDeviceIdFromTopics(teamId, row.topics);
            const byRowId = extractDeviceIdFromRowId(row.id, teamId);
            const deviceKey = byTopics ?? byRowId;
            if (!deviceKey) {
              continue;
            }

            const lastSeenAt = Date.parse(row.lastSeen);
            const normalizedLastSeenAt = Number.isNaN(lastSeenAt) ? Date.now() : lastSeenAt;

            next[deviceKey] = {
              ...next[deviceKey],
              online: row.status === "online",
              lastHeartbeatAt: normalizedLastSeenAt
            };
          }

          return next;
        });
      } catch {
        // Ignore bootstrap failures and continue with SSE-only mode.
      }
    };

    bootstrapDevices();

    const topic = `team/${teamId}/#`;
    const source = new EventSource(`/api/mqtt/stream?topic=${encodeURIComponent(topic)}`);

    source.onmessage = (event) => {
      let payload: MqttStreamPayload | { type: string };
      try {
        payload = JSON.parse(event.data) as MqttStreamPayload | { type: string };
      } catch {
        return;
      }

      if (!("topic" in payload)) {
        return;
      }

      const parsedTopic = parseTopic(payload.topic);
      if (!parsedTopic || parsedTopic.teamId !== teamId) {
        return;
      }

      const deviceKey = parsedTopic.deviceId;
      const receivedAtMs = payload.receivedAt ? Date.parse(payload.receivedAt) : Date.now();
      const nowMs = Number.isNaN(receivedAtMs) ? Date.now() : receivedAtMs;

      setDevices((prev) => {
        const current = prev[deviceKey] ?? {};
        const next: DeviceRealtimeState = { ...current };

        if (parsedTopic.metric === "button" && payload.topic.endsWith("/state")) {
          const buttonState = payload.message.trim().toUpperCase();
          if (buttonState === "PRESSED" || buttonState === "RELEASED") {
            next.buttonState = buttonState;
          }
        }

        if (parsedTopic.metric === "heartbeat") {
          next.lastHeartbeatAt = nowMs;
          next.online = true;
        }

        if (parsedTopic.metric === "status") {
          try {
            const statusPayload = JSON.parse(payload.message) as { online?: unknown };
            if (typeof statusPayload.online === "boolean") {
              next.online = statusPayload.online;
            }
          } catch {
            // Ignore malformed status payloads.
          }
        }

        if (parsedTopic.metric === "temperature" || parsedTopic.metric === "humidity" || parsedTopic.metric === "light") {
          const numericValue = Number(payload.message);
          if (!Number.isFinite(numericValue)) {
            return prev;
          }

          next[parsedTopic.metric] = numericValue;
          next.online = true;

          setSeriesByDevice((oldSeriesByDevice) => {
            const previousSeries = oldSeriesByDevice[deviceKey] ?? [buildDefaultSeriesPoint()];
            const previousPoint = previousSeries[previousSeries.length - 1] ?? buildDefaultSeriesPoint();

            const mergedPoint: TelemetrySeriesPoint = {
              time: toDisplayTime(payload.receivedAt),
              temperature: next.temperature ?? previousPoint.temperature,
              humidity: next.humidity ?? previousPoint.humidity,
              light: next.light ?? previousPoint.light
            };

            const appended = [...previousSeries, mergedPoint].slice(-MAX_POINTS);
            return {
              ...oldSeriesByDevice,
              [deviceKey]: appended
            };
          });
        }

        return {
          ...prev,
          [deviceKey]: next
        };
      });
    };

    return () => {
      source.close();
    };
  }, [teamId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDevices((prev) => {
        const now = Date.now();
        const next: Record<string, DeviceRealtimeState> = {};

        for (const [deviceId, device] of Object.entries(prev)) {
          const heartbeatAt = device.lastHeartbeatAt ?? 0;
          next[deviceId] = {
            ...device,
            online: Boolean(device.online) && now - heartbeatAt <= HEARTBEAT_TIMEOUT_MS
          };
        }

        return next;
      });
    }, 5_000);

    return () => clearInterval(timer);
  }, []);

  const deviceIds = useMemo(() => {
    const ids = new Set<string>([...Object.keys(devices), ...Object.keys(seriesByDevice)]);
    return Array.from(ids.values()).sort();
  }, [devices, seriesByDevice]);

  const resolvedDeviceId = useMemo(() => {
    if (selectedDeviceId && deviceIds.includes(selectedDeviceId)) {
      return selectedDeviceId;
    }

    return deviceIds[0];
  }, [deviceIds, selectedDeviceId]);

  const series = useMemo(() => {
    if (!resolvedDeviceId) {
      return [buildDefaultSeriesPoint()];
    }

    return seriesByDevice[resolvedDeviceId] ?? [buildDefaultSeriesPoint()];
  }, [resolvedDeviceId, seriesByDevice]);

  const latest = useMemo(() => series[series.length - 1], [series]);
  const activeDevices = useMemo(
    () => Object.values(devices).filter((device) => Boolean(device.online)).length,
    [devices]
  );
  const selectedDeviceButtonState = useMemo(() => {
    if (!resolvedDeviceId) {
      return "UNKNOWN";
    }

    return devices[resolvedDeviceId]?.buttonState ?? "UNKNOWN";
  }, [devices, resolvedDeviceId]);
  const buttonStateByDevice = useMemo(() => {
    const map: Record<string, string> = {};
    for (const deviceId of deviceIds) {
      map[deviceId] = devices[deviceId]?.buttonState ?? "UNKNOWN";
    }

    return map;
  }, [deviceIds, devices]);
  const onlineByDevice = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const deviceId of deviceIds) {
      map[deviceId] = Boolean(devices[deviceId]?.online);
    }

    return map;
  }, [deviceIds, devices]);

  return {
    deviceIds,
    selectedDeviceId: resolvedDeviceId,
    series,
    latest,
    activeDevices,
    selectedDeviceButtonState,
    buttonStateByDevice,
    onlineByDevice
  };
}
