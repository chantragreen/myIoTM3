import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  teamId: string;
  login: (teamId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      teamId: "TEAM-DEMO",
      login: (teamId) => set({ isAuthenticated: true, teamId }),
      logout: () => set({ isAuthenticated: false, teamId: "TEAM-DEMO" })
    }),
    {
      name: "aiot-auth-storage"
    }
  )
);
