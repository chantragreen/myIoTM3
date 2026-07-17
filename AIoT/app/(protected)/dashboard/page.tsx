"use client";

import { useEffect, useMemo, useState } from "react";
import { GaugeWidget } from "@/components/dashboard/gauge-widget";
import { TelemetryChart } from "@/components/dashboard/telemetry-chart";
import { StatCard } from "@/components/common/stat-card";
import { useRealtimeTelemetry } from "@/lib/use-realtime-telemetry";
import { createClientId } from "@/lib/client-id";
import { DashboardWidget, WidgetType } from "@/types/telemetry";
import { useAuthStore } from "@/store/auth-store";

const topicOptions = ["temperature", "humidity", "light"] as const;

export default function DashboardPage() {
  const teamId = useAuthStore((state) => state.teamId);
  const [preferredDeviceId, setPreferredDeviceId] = useState<string>("");
  const [mqttConnected, setMqttConnected] = useState<boolean | null>(null);
  const { series, latest, activeDevices, deviceIds, selectedDeviceId } = useRealtimeTelemetry(teamId, preferredDeviceId || undefined);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: createClientId("widget"), title: "Sensor Overview", type: "line", topic: "temperature" },
    { id: createClientId("widget"), title: "Thermal Trend", type: "area", topic: "humidity" }
  ]);
  const [widgetType, setWidgetType] = useState<WidgetType>("line");
  const [widgetTopic, setWidgetTopic] = useState<string>("temperature");

  useEffect(() => {
    const fetchMqttStatus = async () => {
      try {
        const response = await fetch("/api/mqtt/status", { cache: "no-store" });
        if (!response.ok) {
          setMqttConnected(false);
          return;
        }

        const payload = (await response.json()) as { connected?: boolean };
        setMqttConnected(Boolean(payload.connected));
      } catch {
        setMqttConnected(false);
      }
    };

    fetchMqttStatus();
    const timer = setInterval(fetchMqttStatus, 5_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!preferredDeviceId && deviceIds.length > 0) {
      setPreferredDeviceId(deviceIds[0]);
      return;
    }

    if (preferredDeviceId && !deviceIds.includes(preferredDeviceId) && deviceIds.length > 0) {
      setPreferredDeviceId(deviceIds[0]);
    }
  }, [deviceIds, preferredDeviceId]);

  const mqttBadgeClass = useMemo(() => {
    if (mqttConnected) {
      return "bg-emerald-500/20 text-emerald-100";
    }

    return "bg-rose-500/20 text-rose-100";
  }, [mqttConnected]);

  const mqttBadgeLabel = mqttConnected ? "MQTT Connected" : "MQTT Disconnected";

  const addWidget = () => {
    setWidgets((prev) => [
      ...prev,
      {
        id: createClientId("widget"),
        title: `${widgetType.toUpperCase()} - ${widgetTopic}`,
        type: widgetType,
        topic: widgetTopic
      }
    ]);
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active Devices" value={`${activeDevices}`} hint="Heartbeat timeout: 60s" />
        <StatCard title="Temperature" value={`${latest?.temperature ?? 0} °C`} hint={`Live from ${selectedDeviceId ?? "-"}`} />
        <StatCard title="Humidity" value={`${latest?.humidity ?? 0} %RH`} hint={`Live from ${selectedDeviceId ?? "-"}`} />
      </section>

      <section className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-[var(--font-sora)] text-xl font-semibold">Dashboard Widgets</h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs ${mqttBadgeClass}`}>{mqttBadgeLabel}</span>

            <select
              className="rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2 text-sm"
              value={selectedDeviceId ?? ""}
              onChange={(event) => setPreferredDeviceId(event.target.value)}
              disabled={deviceIds.length === 0}
            >
              {deviceIds.length === 0 ? (
                <option value="">No device</option>
              ) : (
                deviceIds.map((deviceId) => (
                  <option value={deviceId} key={deviceId}>
                    {deviceId}
                  </option>
                ))
              )}
            </select>

            <select
              className="rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2 text-sm"
              value={widgetType}
              onChange={(event) => setWidgetType(event.target.value as WidgetType)}
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="gauge">Gauge</option>
            </select>

            <select
              className="rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2 text-sm"
              value={widgetTopic}
              onChange={(event) => setWidgetTopic(event.target.value)}
            >
              {topicOptions.map((topic) => (
                <option value={topic} key={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <button
              className="rounded-xl bg-gradient-to-r from-teal to-cyan px-3 py-2 text-sm font-semibold text-ink"
              onClick={addWidget}
            >
              Add Widget
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {widgets.map((widget) =>
          widget.type === "gauge" ? (
            <GaugeWidget
              key={widget.id}
              title={widget.title}
              value={widget.topic === "humidity" ? latest?.humidity ?? 0 : latest?.temperature ?? 0}
              unit={widget.topic === "humidity" ? "%" : "°C"}
              maxValue={widget.topic === "humidity" ? 100 : 50}
            />
          ) : (
            <TelemetryChart key={widget.id} title={widget.title} type={widget.type} data={series} />
          )
        )}
      </section>
    </div>
  );
}
