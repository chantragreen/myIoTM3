"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/automation", label: "Automation (AI Rules)" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass w-full rounded-2xl p-4 lg:h-[calc(100vh-2rem)] lg:w-72 lg:rounded-3xl">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">AIoT Activity Hub</p>
      <h2 className="mt-3 font-[var(--font-sora)] text-xl font-semibold">Control Center</h2>

      <nav className="mt-6 space-y-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "block rounded-xl px-4 py-3 text-sm transition",
                active
                  ? "bg-cyan/30 text-cyan-100 shadow-glow"
                  : "bg-white/5 text-slate-100 hover:bg-white/15"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-cyan/30 bg-cyan/10 p-3 text-xs text-cyan-50">
        <p className="font-medium">MQTT Broker</p>
        <p className="mt-1 text-cyan-100/90">172.16.3.205</p>
      </div>
    </aside>
  );
}
