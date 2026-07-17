"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPageClient() {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTeamId = teamId.trim().toUpperCase();
    if (!normalizedTeamId || !password.trim()) {
      setError("กรุณากรอก Team ID และรหัสผ่าน");
      return;
    }

    if (normalizedTeamId === "TEAM-DEMO") {
      setError("TEAM-DEMO ถูกปิดใช้งานใน production กรุณาใช้ Team ID จริง");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/settings/team-policy", { cache: "no-store" });
      if (!response.ok) {
        setError("ไม่สามารถตรวจสอบ policy ทีมได้ กรุณาลองใหม่");
        return;
      }

      const policy = (await response.json()) as {
        lockEnabled?: boolean;
        allowedTeamIds?: string[];
      };

      const allowedTeamIds = Array.isArray(policy.allowedTeamIds) ? policy.allowedTeamIds : [];
      if (policy.lockEnabled && !allowedTeamIds.includes(normalizedTeamId)) {
        setError("Team ID นี้ยังไม่อยู่ใน allowed list ของ production");
        return;
      }

      login(normalizedTeamId);
      router.push("/dashboard");
    } catch {
      setError("เกิดข้อผิดพลาดในการตรวจสอบ Team ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center p-5">
      <section className="glass w-full max-w-md rounded-3xl p-8 text-slate-50">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">AIoT Activity Hub</p>
        <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-semibold">Team Sign In</h1>
        <p className="mt-2 text-sm text-slate-200/80">เข้าสู่ระบบด้วย Team ID และรหัสผ่านที่ทีมงานมอบให้</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            Team ID
            <input
              className="mt-1 w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              placeholder="TEAM-001"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="rounded-lg bg-rose-600/15 p-2 text-xs text-rose-200">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2 font-semibold text-ink transition hover:brightness-110"
          >
            {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </section>
    </main>
  );
}
