import { TelemetrySeriesPoint } from "@/types/telemetry";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const buildTelemetryPoint = (prev?: TelemetrySeriesPoint): TelemetrySeriesPoint => {
  const now = new Date();

  const nextTemperature = clamp((prev?.temperature ?? 26) + (Math.random() * 2 - 1), 18, 40);
  const nextHumidity = clamp((prev?.humidity ?? 61) + (Math.random() * 4 - 2), 35, 95);
  const nextLight = clamp((prev?.light ?? 430) + (Math.random() * 40 - 20), 80, 940);

  return {
    time: now.toLocaleTimeString("th-TH", { hour12: false }),
    temperature: Number(nextTemperature.toFixed(2)),
    humidity: Number(nextHumidity.toFixed(2)),
    light: Number(nextLight.toFixed(2))
  };
};

export const buildTelemetrySeed = (length = 24) => {
  const points: TelemetrySeriesPoint[] = [];

  for (let index = 0; index < length; index += 1) {
    points.push(buildTelemetryPoint(points[index - 1]));
  }

  return points;
};
