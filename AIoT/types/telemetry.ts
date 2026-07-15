export interface TelemetryPoint {
  timestamp: string;
  topic: string;
  value: number;
}

export interface TelemetrySeriesPoint {
  time: string;
  temperature: number;
  humidity: number;
  light: number;
}

export type WidgetType = "line" | "area" | "gauge";

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  topic: string;
}
