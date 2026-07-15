"use client";

import { useEffect, useMemo, useState } from "react";
import { buildTelemetryPoint, buildTelemetrySeed } from "@/lib/mock-telemetry";
import { TelemetrySeriesPoint } from "@/types/telemetry";

const MAX_POINTS = 40;

export function useRealtimeTelemetry() {
  const [series, setSeries] = useState<TelemetrySeriesPoint[]>(() => buildTelemetrySeed(22));

  useEffect(() => {
    const timer = setInterval(() => {
      setSeries((prev) => {
        const nextPoint = buildTelemetryPoint(prev[prev.length - 1]);
        const merged = [...prev, nextPoint];
        return merged.slice(-MAX_POINTS);
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const latest = useMemo(() => series[series.length - 1], [series]);

  return {
    series,
    latest
  };
}
