"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const router = useRouter();
  const teamId = useAuthStore((state) => state.teamId);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Team Workspace</p>
        <p className="font-[var(--font-sora)] text-2xl font-semibold">{teamId}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100">Realtime Connected</span>
        <button
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
