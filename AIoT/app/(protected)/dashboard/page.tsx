"use client";

import { useMemo, useState } from "react";
import { GaugeWidget } from "@/components/dashboard/gauge-widget";
import { TelemetryChart } from "@/components/dashboard/telemetry-chart";
import { StatCard } from "@/components/common/stat-card";
import { useRealtimeTelemetry } from "@/lib/use-realtime-telemetry";
import { DashboardWidget, WidgetType } from "@/types/telemetry";

const topicOptions = ["temperature", "humidity", "light"] as const;

export default function DashboardPage() {
  const { series, latest } = useRealtimeTelemetry();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: crypto.randomUUID(), title: "Sensor Overview", type: "line", topic: "temperature" },
    { id: crypto.randomUUID(), title: "Thermal Trend", type: "area", topic: "humidity" }
  ]);
  const [widgetType, setWidgetType] = useState<WidgetType>("line");
  const [widgetTopic, setWidgetTopic] = useState<string>("temperature");

  const activeDevices = useMemo(() => Math.floor(8 + (latest?.humidity ?? 0) % 3), [latest?.humidity]);

  const addWidget = () => {
    setWidgets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: `${widgetType.toUpperCase()} - ${widgetTopic}`,
        type: widgetType,
        topic: widgetTopic
      }
    ]);
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active Devices" value={`${activeDevices}`} hint="Auto refresh every 1.5s" />
        <StatCard title="Temperature" value={`${latest?.temperature ?? 0} °C`} hint="From MQTT telemetry stream (dummy)" />
        <StatCard title="Humidity" value={`${latest?.humidity ?? 0} %RH`} hint="Bound to widget topic" />
      </section>

      <section className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-[var(--font-sora)] text-xl font-semibold">Dashboard Widgets</h3>

          <div className="flex flex-wrap items-center gap-2">
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
