"use client";

import { FormEvent, useState } from "react";
import { DeviceType } from "@/types/device";

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; type: DeviceType; macAddress: string }) => Promise<void>;
}

export function DeviceFormModal({ isOpen, onClose, onSubmit }: DeviceFormModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DeviceType>("sensor");
  const [macAddress, setMacAddress] = useState("");

  if (!isOpen) {
    return null;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ name, type, macAddress });
    setName("");
    setType("sensor");
    setMacAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <form className="glass w-full max-w-lg rounded-2xl p-5" onSubmit={submit}>
        <h3 className="font-[var(--font-sora)] text-xl font-semibold">+ Add Device</h3>
        <p className="mt-1 text-sm text-slate-200/75">รองรับ Sensor, Actuator และ Edge Station (Raspberry Pi Pico W)</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            Device Name
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Pico W #01"
            />
          </label>

          <label className="text-sm">
            Type
            <select
              className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2"
              value={type}
              onChange={(event) => setType(event.target.value as DeviceType)}
            >
              <option value="sensor">Sensor</option>
              <option value="actuator">Actuator</option>
              <option value="edge-station">Edge Station</option>
            </select>
          </label>

          <label className="text-sm">
            MAC Address
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2"
              value={macAddress}
              onChange={(event) => setMacAddress(event.target.value)}
              placeholder="28:CD:C1:10:AF:EE"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2 text-sm font-semibold text-ink">
            Save Device
          </button>
        </div>
      </form>
    </div>
  );
}
