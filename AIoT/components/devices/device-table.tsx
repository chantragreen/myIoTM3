"use client";

import { Device } from "@/types/device";

interface DeviceTableProps {
  devices: Device[];
  onDelete: (id: string) => Promise<void>;
}

const formatLastSeen = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { absolute: "-", relative: "-" };
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  let relative = `${seconds}s ago`;
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    relative = `${minutes}m ago`;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      relative = `${hours}h ago`;
    }
  }

  return {
    absolute: date.toLocaleString("th-TH", { hour12: false }),
    relative
  };
};

export function DeviceTable({ devices, onDelete }: DeviceTableProps) {
  return (
    <section className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/10 text-xs uppercase tracking-[0.14em] text-cyan-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">MAC Address</th>
              <th className="px-4 py-3">Topics</th>
              <th className="px-4 py-3">Last Seen</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => {
              const seen = formatLastSeen(device.lastSeen);
              return (
                <tr key={device.id} className="border-b border-white/10 text-slate-100 last:border-0">
                  <td className="px-4 py-4">{device.name}</td>
                  <td className="px-4 py-4 capitalize">{device.type}</td>
                  <td className="px-4 py-4">{device.macAddress}</td>
                  <td className="px-4 py-4">
                    <div className="max-w-xs space-y-1">
                      {device.topics.map((topic) => (
                        <p key={topic} className="truncate text-xs text-cyan-100/90">
                          {topic}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-100">{seen.absolute}</p>
                    <p className="mt-1 text-[11px] text-slate-300/80">{seen.relative}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-100">{device.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="rounded-lg border border-rose-300/40 px-3 py-1 text-xs text-rose-100" onClick={() => onDelete(device.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
