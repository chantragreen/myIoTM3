"use client";

import { useEffect, useState } from "react";
import { DeviceFormModal } from "@/components/devices/device-form-modal";
import { DeviceTable } from "@/components/devices/device-table";
import { useAuthStore } from "@/store/auth-store";
import { useDeviceStore } from "@/store/device-store";
import { DeviceType } from "@/types/device";

export default function DevicesPage() {
  const [open, setOpen] = useState(false);
  const teamId = useAuthStore((state) => state.teamId);
  const { devices, loadDevices, addDevice, removeDevice, isLoading, error } = useDeviceStore();

  useEffect(() => {
    loadDevices(teamId);

    const timer = setInterval(() => {
      loadDevices(teamId);
    }, 10_000);

    return () => clearInterval(timer);
  }, [loadDevices, teamId]);

  const createDevice = async (payload: { name: string; type: DeviceType; macAddress: string }) => {
    await addDevice({ ...payload, teamId });
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="glass flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[var(--font-sora)] text-2xl font-semibold">Devices</h1>
          <p className="mt-1 text-sm text-slate-200/80">เพิ่ม Sensor, Actuator และ Edge Station ของ Raspberry Pi Pico W แบบไดนามิก</p>
        </div>

        <button className="rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2 font-semibold text-ink" onClick={() => setOpen(true)}>
          + Add Device
        </button>
      </section>

      {error && <p className="rounded-xl bg-rose-500/20 px-4 py-3 text-sm text-rose-100">{error}</p>}

      {isLoading && <p className="text-sm text-slate-200/80">กำลังโหลดข้อมูลอุปกรณ์...</p>}

      <DeviceTable devices={devices} onDelete={removeDevice} />

      <DeviceFormModal isOpen={open} onClose={() => setOpen(false)} onSubmit={createDevice} />
    </div>
  );
}
