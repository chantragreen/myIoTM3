import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  teamId: string;
  login: (teamId: string) => void;
  logout: () => void;
}

const memoryStorage = (): StateStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (name) => data.get(name) ?? null,
    setItem: (name, value) => {
      data.set(name, value);
    },
    removeItem: (name) => {
      data.delete(name);
    }
  };
};

const safeStorage = createJSONStorage<AuthState>(() => {
  if (typeof window === "undefined") {
    return memoryStorage();
  }

  try {
    const probe = "__aiot_auth_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      teamId: "",
      login: (teamId) => set({ isAuthenticated: true, teamId }),
      logout: () => set({ isAuthenticated: false, teamId: "" })
    }),
    {
      name: "aiot-auth-storage",
      storage: safeStorage,
      onRehydrateStorage: () => (_state, error) => {
        if (!error || typeof window === "undefined") {
          return;
        }

        // Corrupted or blocked local storage can crash hydration on client.
        try {
          window.localStorage.removeItem("aiot-auth-storage");
        } catch {
          // Ignore storage access failures and continue with in-memory defaults.
        }
      }
    }
  )
);
