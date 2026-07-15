"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 p-4 lg:flex-row">
        <Sidebar />

        <main className="flex-1 space-y-4">
          <Topbar />
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
