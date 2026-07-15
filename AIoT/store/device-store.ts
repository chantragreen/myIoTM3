import { create } from "zustand";
import { Device } from "@/types/device";

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error?: string;
  loadDevices: (teamId: string) => Promise<void>;
  addDevice: (payload: { name: string; type: Device["type"]; macAddress: string; teamId: string }) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: undefined,

  loadDevices: async (teamId) => {
    set({ isLoading: true, error: undefined });

    try {
      const response = await fetch(`/api/devices?teamId=${encodeURIComponent(teamId)}`);
      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดรายการอุปกรณ์ได้");
      }

      const devices = (await response.json()) as Device[];
      set({ devices, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  addDevice: async (payload) => {
    set({ isLoading: true, error: undefined });

    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-team-id": payload.teamId
        },
        body: JSON.stringify({
          name: payload.name,
          type: payload.type,
          macAddress: payload.macAddress
        })
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถเพิ่มอุปกรณ์ได้");
      }

      const created = (await response.json()) as Device;
      set({ devices: [created, ...get().devices], isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  removeDevice: async (deviceId) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("ไม่สามารถลบอุปกรณ์ได้");
      }

      set({ devices: get().devices.filter((device) => device.id !== deviceId) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
}));
