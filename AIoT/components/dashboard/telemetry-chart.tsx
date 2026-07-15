"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { TelemetrySeriesPoint, WidgetType } from "@/types/telemetry";

interface TelemetryChartProps {
  title: string;
  type: WidgetType;
  data: TelemetrySeriesPoint[];
}

export function TelemetryChart({ title, type, data }: TelemetryChartProps) {
  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="font-[var(--font-sora)] text-lg font-semibold">{title}</h3>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D1E7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#34D1E7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="5 6" />
              <XAxis dataKey="time" stroke="#CFE6F6" tick={{ fontSize: 11 }} />
              <YAxis stroke="#CFE6F6" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f1b30", border: "1px solid rgba(255,255,255,0.15)" }} />
              <Legend />
              <Area type="monotone" dataKey="temperature" stroke="#34D1E7" fill="url(#temp)" name="Temperature" />
              <Area type="monotone" dataKey="humidity" stroke="#A0F0D0" fillOpacity={0} name="Humidity" />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <XAxis dataKey="time" stroke="#CFE6F6" tick={{ fontSize: 11 }} />
              <YAxis stroke="#CFE6F6" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f1b30", border: "1px solid rgba(255,255,255,0.15)" }} />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#FF7A59" strokeWidth={2.4} dot={false} name="Temperature" />
              <Line type="monotone" dataKey="humidity" stroke="#34D1E7" strokeWidth={2.4} dot={false} name="Humidity" />
              <Line type="monotone" dataKey="light" stroke="#A0F0D0" strokeWidth={2.4} dot={false} name="Light" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
