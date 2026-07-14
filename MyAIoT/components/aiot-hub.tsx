"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useReducer,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Cable,
  Cpu,
  Gauge,
  MoonStar,
  Plus,
  RadioTower,
  Send,
  ShieldCheck,
  SunMedium,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { useRealtimeFeed } from "@/hooks/use-realtime-feed";
import type { AiRule, CommandLog, Device, DeviceStatus, DeviceType } from "@/lib/aiot";

const sections = ["Overview", "Devices", "Dashboard", "Automation", "Guides"];

type ThemeMode = "light" | "dark";

interface AiotHubProps {
  initialDevices: Device[];
  initialRules: AiRule[];
}

interface HubState {
  devices: Device[];
  rules: AiRule[];
  commandLogs: CommandLog[];
}

type HubAction =
  | { type: "add-device"; payload: Device }
  | { type: "add-rule"; payload: AiRule }
  | { type: "log-command"; payload: CommandLog };

interface PublishResponse {
  ok: boolean;
  error?: string;
  mode?: "demo" | "broker";
  topic?: string;
  payload?: string;
  message?: string;
}

function hubReducer(state: HubState, action: HubAction): HubState {
  switch (action.type) {
    case "add-device":
      return {
        ...state,
        devices: [action.payload, ...state.devices],
      };
    case "add-rule":
      return {
        ...state,
        rules: [action.payload, ...state.rules],
      };
    case "log-command":
      return {
        ...state,
        commandLogs: [action.payload, ...state.commandLogs].slice(0, 8),
      };
    default:
      return state;
  }
}

function getStatusTone(status: DeviceStatus) {
  if (status === "online") {
    return "bg-emerald-400/15 text-emerald-500";
  }

  if (status === "warning") {
    return "bg-amber-400/15 text-amber-500";
  }

  return "bg-rose-400/15 text-rose-500";
}

function Panel({
  title,
  eyebrow,
  id,
  children,
}: Readonly<{
  title: string;
  eyebrow: string;
  id?: string;
  children: React.ReactNode;
}>) {
  return (
    <section id={id} className="glass-panel section-shell rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
          <h2 className="mt-2 display-font text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  accent,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  accent: string;
}>) {
  return (
    <div className="metric-ring rounded-[28px] bg-[var(--surface-strong)] p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 display-font text-3xl font-semibold tracking-[-0.05em]">{value}</p>
      <div className="mt-4 h-1.5 rounded-full bg-black/8 dark:bg-white/8">
        <div className={`h-full rounded-full ${accent}`} />
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </div>
  );
}

export function AiotHub({ initialDevices, initialRules }: Readonly<AiotHubProps>) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem("aiot-theme");

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [deviceQuery, setDeviceQuery] = useState("");
  const deferredDeviceQuery = useDeferredValue(deviceQuery);
  const [publishTopic, setPublishTopic] = useState("/team-alpha/relay/1");
  const [publishPayload, setPublishPayload] = useState('{"command":"ON"}');
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    name: "",
    type: "ESP32" as DeviceType,
    macAddress: "",
    location: "",
  });
  const [ruleForm, setRuleForm] = useState({
    name: "Presence trigger",
    condition: "temperature > 30 and occupancy > 65",
    action: 'Publish "ON"',
    targetTopic: "/team-alpha/relay/1",
  });
  const [state, dispatch] = useReducer(hubReducer, {
    devices: initialDevices,
    rules: initialRules,
    commandLogs: [],
  });

  const { latest, samples, visionEvents } = useRealtimeFeed();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("aiot-theme", theme);
  }, [theme]);

  const filteredDevices = state.devices.filter((device) => {
    const keyword = deferredDeviceQuery.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return [device.name, device.type, device.location, device.topic]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  const onlineDevices = state.devices.filter((device) => device.status === "online").length;
  const armedRules = state.rules.filter((rule) => rule.status === "armed").length;

  async function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPublishing(true);
    setPublishFeedback(null);

    try {
      const response = await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: publishTopic,
          payload: publishPayload,
        }),
      });
      const result = (await response.json()) as PublishResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Unable to publish message.");
      }

      dispatch({
        type: "log-command",
        payload: {
          id: crypto.randomUUID(),
          topic: result.topic ?? publishTopic,
          payload: result.payload ?? publishPayload,
          transport: result.mode === "broker" ? "MQTT broker" : "Demo mode",
          result: "sent",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        },
      });
      setPublishFeedback(result.message ?? "Command dispatched.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to publish command.";
      dispatch({
        type: "log-command",
        payload: {
          id: crypto.randomUUID(),
          topic: publishTopic,
          payload: publishPayload,
          transport: "MQTT broker",
          result: "error",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        },
      });
      setPublishFeedback(message);
    } finally {
      setIsPublishing(false);
    }
  }

  function handleAddDevice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      dispatch({
        type: "add-device",
        payload: {
          id: crypto.randomUUID(),
          name: deviceForm.name,
          type: deviceForm.type,
          status: Math.random() > 0.78 ? "warning" : "online",
          macAddress: deviceForm.macAddress,
          location: deviceForm.location,
          topic: `/team-alpha/${deviceForm.type.toLowerCase().replace(/\s+/g, "-")}/${deviceForm.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
          lastSeen: "just now",
        },
      });
    });

    setDeviceForm({
      name: "",
      type: "ESP32",
      macAddress: "",
      location: "",
    });
  }

  function handleAddRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      dispatch({
        type: "add-rule",
        payload: {
          id: crypto.randomUUID(),
          name: ruleForm.name,
          condition: ruleForm.condition,
          action: ruleForm.action,
          targetTopic: ruleForm.targetTopic,
          status: "draft",
        },
      });
    });

    setRuleForm((current) => ({
      ...current,
      name: "New automation",
      condition: "occupancy > 80 and face detected",
    }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-panel sticky top-4 z-20 rounded-[28px] px-4 py-3 sm:px-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--hero-mid),var(--hero-end))] text-white shadow-lg shadow-cyan-400/20">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <p className="display-font text-xl font-semibold tracking-[-0.03em]">AIoT Activity Hub</p>
              <p className="text-sm text-muted">Control center for workshops, hackathons, and lab telemetry</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <a
                  key={section}
                  href={`#${section.toLowerCase()}`}
                  className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  {section}
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className="inline-flex items-center justify-center rounded-full bg-[var(--surface-strong)] p-3 text-foreground transition hover:scale-[1.02]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <motion.section
        id="overview"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="section-shell overflow-hidden rounded-[36px] bg-[linear-gradient(130deg,var(--hero-start),var(--hero-mid),var(--hero-end))] px-6 py-7 text-white shadow-[0_40px_120px_rgba(5,10,26,0.45)] sm:px-8 sm:py-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm uppercase tracking-[0.24em] text-cyan-100 backdrop-blur">
              Live event cockpit
            </div>
            <div className="space-y-4">
              <h1 className="display-font max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-7xl">
                Build, monitor, and automate AIoT experiences from one responsive dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-blue-100/92 sm:text-lg">
                Designed for students, makers, and organizers who need real-time telemetry, AI signal interpretation,
                and hardware control during workshops and hackathons.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-blue-50/92">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">MQTT + REST</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Dummy live stream</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Drag-ready widget concept</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-panel rounded-[28px] border-white/10 bg-white/10 p-5 text-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100/72">Teams online</span>
                <RadioTower className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-4 display-font text-4xl font-semibold">12</p>
              <p className="mt-2 text-sm text-blue-100/72">Event lanes with active dashboards</p>
            </div>
            <div className="glass-panel rounded-[28px] border-white/10 bg-white/10 p-5 text-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100/72">Inference latency</span>
                <Bot className="h-4 w-4 text-pink-200" />
              </div>
              <p className="mt-4 display-font text-4xl font-semibold">148 ms</p>
              <p className="mt-2 text-sm text-blue-100/72">Computer vision loop</p>
            </div>
            <div className="glass-panel rounded-[28px] border-white/10 bg-white/10 p-5 text-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100/72">Online devices</span>
                <Wifi className="h-4 w-4 text-emerald-200" />
              </div>
              <p className="mt-4 display-font text-4xl font-semibold">{onlineDevices}</p>
              <p className="mt-2 text-sm text-blue-100/72">Across all registered boards</p>
            </div>
            <div className="glass-panel rounded-[28px] border-white/10 bg-white/10 p-5 text-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100/72">Broker mode</span>
                <ShieldCheck className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-4 display-font text-4xl font-semibold">Demo</p>
              <p className="mt-2 text-sm text-blue-100/72">Switch to broker with environment variables</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Signal Overview" eyebrow="Realtime dashboard" id="dashboard">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Temperature"
              value={`${latest.temperature.toFixed(1)} C`}
              detail="Live greenhouse or environment reading"
              accent="w-[72%] bg-[linear-gradient(90deg,var(--accent-cyan),var(--accent-mint))]"
            />
            <MetricCard
              label="Humidity"
              value={`${latest.humidity.toFixed(1)} %`}
              detail="Stable moisture band for workshop demo"
              accent="w-[64%] bg-[linear-gradient(90deg,var(--accent-gold),var(--accent-pink))]"
            />
            <MetricCard
              label="Occupancy"
              value={`${latest.occupancy} %`}
              detail="AI-estimated human presence from camera feed"
              accent="w-[80%] bg-[linear-gradient(90deg,var(--accent-mint),var(--accent-cyan))]"
            />
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[28px] bg-[var(--surface-strong)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="display-font text-xl font-semibold">Telemetry wave</p>
                  <p className="text-sm text-muted">Streaming sensor samples every 1.8 seconds</p>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-500">Live</div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={samples}>
                    <CartesianGrid stroke="rgba(127, 146, 177, 0.16)" vertical={false} />
                    <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#6de9ff" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="humidity" stroke="#ff6fb5" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] bg-[var(--surface-strong)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="display-font text-xl font-semibold">Power Load</p>
                    <p className="text-sm text-muted">Board power envelope</p>
                  </div>
                  <Gauge className="h-5 w-5 text-cyan-500" />
                </div>
                <div className="mt-4 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={samples}>
                      <defs>
                        <linearGradient id="power-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7bffd3" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#7bffd3" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(127, 146, 177, 0.16)" vertical={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="power" stroke="#7bffd3" fill="url(#power-fill)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[28px] bg-[var(--surface-strong)] p-4">
                <p className="display-font text-xl font-semibold">Vision events</p>
                <div className="mt-4 space-y-3">
                  {visionEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-black/6 bg-white/40 p-3 dark:border-white/6 dark:bg-black/10">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{event.label}</p>
                        <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-600">
                          {event.confidence}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{event.camera} at {event.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Operator Summary" eyebrow="Event health">
          <div className="grid gap-4">
            <div className="rounded-[28px] bg-[var(--surface-strong)] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="display-font text-xl font-semibold">Current posture</p>
                <Activity className="h-5 w-5 text-pink-500" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-sm text-muted">Armed rules</p>
                  <p className="mt-2 display-font text-3xl font-semibold">{armedRules}</p>
                </div>
                <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-sm text-muted">Latest power</p>
                  <p className="mt-2 display-font text-3xl font-semibold">{latest.power.toFixed(1)} W</p>
                </div>
                <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-sm text-muted">Fallback channel</p>
                  <p className="mt-2 text-base leading-7">REST publish API mirrors the MQTT command workflow for team tooling.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-[var(--surface-strong)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="display-font text-xl font-semibold">Occupancy pulse</p>
                  <p className="text-sm text-muted">Recent AI confidence trend</p>
                </div>
                <Bot className="h-5 w-5 text-cyan-500" />
              </div>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={samples.slice(-8)}>
                    <CartesianGrid stroke="rgba(127, 146, 177, 0.16)" vertical={false} />
                    <Tooltip />
                    <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Bar dataKey="occupancy" fill="#6de9ff" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Panel title="Device Management" eyebrow="Devices" id="devices">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={deviceQuery}
                onChange={(event) => setDeviceQuery(event.target.value)}
                placeholder="Search device, type, topic"
                className="w-full rounded-2xl border border-black/8 bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-cyan-400 dark:border-white/8"
              />
              <div className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm text-muted">
                {filteredDevices.length} visible
              </div>
            </div>

            <div className="grid gap-3">
              {filteredDevices.map((device) => (
                <div key={device.id} className="rounded-[24px] bg-[var(--surface-strong)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="display-font text-lg font-semibold">{device.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${getStatusTone(device.status)}`}>
                          {device.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{device.type} • {device.location}</p>
                      <p className="mt-2 text-sm text-muted">{device.macAddress}</p>
                    </div>
                    <div className="rounded-2xl bg-black/5 px-3 py-2 text-sm text-muted dark:bg-white/5">
                      {device.lastSeen}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-black/5 px-3 py-2 text-sm text-muted dark:bg-white/5">
                    {device.status === "offline" ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                    {device.topic}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddDevice} className="rounded-[28px] bg-[var(--surface-strong)] p-4">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-cyan-500" />
                <p className="display-font text-xl font-semibold">Add device</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={deviceForm.name}
                  onChange={(event) => setDeviceForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Device name"
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/8 dark:bg-black/10"
                />
                <select
                  value={deviceForm.type}
                  onChange={(event) =>
                    setDeviceForm((current) => ({ ...current, type: event.target.value as DeviceType }))
                  }
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/8 dark:bg-black/10"
                >
                  <option>ESP32</option>
                  <option>Raspberry Pi</option>
                  <option>Vision Camera</option>
                </select>
                <input
                  required
                  value={deviceForm.macAddress}
                  onChange={(event) => setDeviceForm((current) => ({ ...current, macAddress: event.target.value }))}
                  placeholder="MAC Address"
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/8 dark:bg-black/10"
                />
                <input
                  required
                  value={deviceForm.location}
                  onChange={(event) => setDeviceForm((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Deployment location"
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/8 dark:bg-black/10"
                />
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px] dark:bg-cyan-400 dark:text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Register device
              </button>
            </form>
          </div>
        </Panel>

        <Panel title="Automation Rules" eyebrow="Automation" id="automation">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {state.rules.map((rule) => (
                <div key={rule.id} className="rounded-[24px] bg-[var(--surface-strong)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="display-font text-lg font-semibold">{rule.name}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                        rule.status === "armed"
                          ? "bg-emerald-400/15 text-emerald-500"
                          : "bg-slate-400/15 text-slate-500 dark:text-slate-300"
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{rule.condition}</p>
                  <div className="mt-4 rounded-2xl bg-black/5 px-3 py-2 text-sm text-muted dark:bg-white/5">
                    {rule.action} → {rule.targetTopic}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddRule} className="rounded-[28px] bg-[var(--surface-strong)] p-4">
              <div className="flex items-center gap-3">
                <Cable className="h-5 w-5 text-pink-500" />
                <p className="display-font text-xl font-semibold">Rule builder</p>
              </div>
              <div className="mt-4 grid gap-3">
                <input
                  required
                  value={ruleForm.name}
                  onChange={(event) => setRuleForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Rule name"
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-pink-400 dark:border-white/8 dark:bg-black/10"
                />
                <textarea
                  required
                  value={ruleForm.condition}
                  onChange={(event) => setRuleForm((current) => ({ ...current, condition: event.target.value }))}
                  placeholder="Condition"
                  rows={3}
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-pink-400 dark:border-white/8 dark:bg-black/10"
                />
                <input
                  required
                  value={ruleForm.action}
                  onChange={(event) => setRuleForm((current) => ({ ...current, action: event.target.value }))}
                  placeholder="Action"
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-pink-400 dark:border-white/8 dark:bg-black/10"
                />
                <input
                  required
                  value={ruleForm.targetTopic}
                  onChange={(event) => setRuleForm((current) => ({ ...current, targetTopic: event.target.value }))}
                  placeholder="Target topic"
                  className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-pink-400 dark:border-white/8 dark:bg-black/10"
                />
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,var(--hero-mid),var(--hero-end))] px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px]"
              >
                <Plus className="h-4 w-4" />
                Save as draft
              </button>
            </form>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="MQTT Command Console" eyebrow="Command bus">
          <form onSubmit={handlePublish} className="rounded-[28px] bg-[var(--surface-strong)] p-4">
            <div className="grid gap-3">
              <input
                required
                value={publishTopic}
                onChange={(event) => setPublishTopic(event.target.value)}
                placeholder="MQTT topic"
                className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/8 dark:bg-black/10"
              />
              <textarea
                required
                value={publishPayload}
                onChange={(event) => setPublishPayload(event.target.value)}
                rows={5}
                placeholder="Payload"
                className="rounded-2xl border border-black/8 bg-white/60 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/8 dark:bg-black/10"
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isPublishing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-cyan-400 dark:text-slate-950"
              >
                <Send className="h-4 w-4" />
                {isPublishing ? "Sending..." : "Publish command"}
              </button>
              {publishFeedback ? <p className="text-sm text-muted">{publishFeedback}</p> : null}
            </div>
          </form>

          <div className="mt-4 space-y-3">
            {state.commandLogs.length === 0 ? (
              <div className="rounded-[24px] bg-[var(--surface-strong)] p-4 text-sm text-muted">
                No commands published yet. Use the form above to simulate or dispatch a message.
              </div>
            ) : (
              state.commandLogs.map((log) => (
                <div key={log.id} className="rounded-[24px] bg-[var(--surface-strong)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{log.topic}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                        log.result === "sent"
                          ? "bg-emerald-400/15 text-emerald-500"
                          : "bg-rose-400/15 text-rose-500"
                      }`}
                    >
                      {log.result}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{log.payload}</p>
                  <p className="mt-3 text-sm text-muted">{log.transport} • {log.timestamp}</p>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Usage and Maintenance" eyebrow="Guides" id="guides">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] bg-[var(--surface-strong)] p-4">
              <p className="display-font text-xl font-semibold">Participant flow</p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <li>1. Login with Team ID and password supplied by the event team.</li>
                <li>2. Add an ESP32 or Raspberry Pi board and capture its generated topic namespace.</li>
                <li>3. Attach live widgets to sensor topics, then review the AI telemetry panels.</li>
                <li>4. Create automation rules that publish commands when thresholds or detections are met.</li>
              </ol>
            </div>
            <div className="rounded-[28px] bg-[var(--surface-strong)] p-4">
              <p className="display-font text-xl font-semibold">Admin checklist</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <li>Daily: verify broker uptime and investigate repeated disconnects.</li>
                <li>Weekly: clear retained MQTT messages before the next activity block.</li>
                <li>Post-event: purge or archive time-series data for storage efficiency.</li>
                <li>Monthly: rotate keys, audit dependencies, and back up environment configuration.</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-[28px] bg-[var(--surface-strong)] p-4">
            <p className="display-font text-xl font-semibold">Runbook</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">Install</p>
                <p className="mt-2 font-medium">npm install</p>
              </div>
              <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">Develop</p>
                <p className="mt-2 font-medium">npm run dev</p>
              </div>
              <div className="rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">Validate</p>
                <p className="mt-2 font-medium">npm run lint && npm run build</p>
              </div>
            </div>
          </div>
        </Panel>
      </section>
    </main>
  );
}