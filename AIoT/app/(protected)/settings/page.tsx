"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

interface TeamPolicyAuditEntry {
  ts: string;
  action: "update" | "reset";
  actor: string;
  sourceIp: string;
  userAgent: string;
  lockEnabled: boolean;
  allowedTeamIds: string[];
}

interface TeamPolicyPayload {
  lockEnabled: boolean;
  allowedTeamIds: string[];
  blockedTeamIds: string[];
  audit: TeamPolicyAuditEntry[];
}

const parseAllowedText = (value: string) => {
  const parts = value
    .split(/[,\n]/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return Array.from(new Set(parts.values()));
};

export default function SettingsPage() {
  const teamId = useAuthStore((state) => state.teamId);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [allowedText, setAllowedText] = useState("");
  const [blockedTeamIds, setBlockedTeamIds] = useState<string[]>([]);
  const [audit, setAudit] = useState<TeamPolicyAuditEntry[]>([]);
  const [auditActorFilter, setAuditActorFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<"" | "update" | "reset">("");
  const [auditFromDate, setAuditFromDate] = useState("");
  const [auditToDate, setAuditToDate] = useState("");
  const [auditLimit, setAuditLimit] = useState("50");
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const actorHeaderValue = teamId?.trim() ? teamId.trim().toUpperCase() : "unknown";

  const applyPayload = (payload: TeamPolicyPayload) => {
    setLockEnabled(Boolean(payload.lockEnabled));
    setAllowedText((payload.allowedTeamIds ?? []).join("\n"));
    setBlockedTeamIds(payload.blockedTeamIds ?? []);
    setAudit(payload.audit ?? []);
  };

  const loadPolicy = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const params = new URLSearchParams();
      if (auditActorFilter.trim()) {
        params.set("actor", auditActorFilter.trim());
      }
      if (auditActionFilter) {
        params.set("action", auditActionFilter);
      }
      if (auditFromDate) {
        params.set("from", auditFromDate);
      }
      if (auditToDate) {
        params.set("to", auditToDate);
      }
      if (auditLimit.trim()) {
        params.set("limit", auditLimit.trim());
      }

      const query = params.toString();
      const response = await fetch(`/api/settings/team-policy${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("โหลด policy ไม่สำเร็จ");
      }

      const payload = (await response.json()) as TeamPolicyPayload;
      applyPayload(payload);
    } catch {
      setError("ไม่สามารถโหลด settings ได้");
    } finally {
      setIsLoading(false);
    }
  }, [auditActionFilter, auditActorFilter, auditFromDate, auditLimit, auditToDate]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const allowedPreview = useMemo(() => parseAllowedText(allowedText), [allowedText]);
  const auditTotalPages = useMemo(() => Math.max(1, Math.ceil(audit.length / auditPageSize)), [audit, auditPageSize]);
  const pagedAudit = useMemo(() => {
    const start = (auditPage - 1) * auditPageSize;
    return audit.slice(start, start + auditPageSize);
  }, [audit, auditPage, auditPageSize]);

  useEffect(() => {
    setAuditPage(1);
  }, [audit]);

  useEffect(() => {
    if (auditPage > auditTotalPages) {
      setAuditPage(auditTotalPages);
    }
  }, [auditPage, auditTotalPages]);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings/team-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-policy-actor": actorHeaderValue
        },
        body: JSON.stringify({
          lockEnabled,
          allowedTeamIds: allowedPreview
        })
      });

      if (!response.ok) {
        throw new Error("save failed");
      }

      const payload = (await response.json()) as TeamPolicyPayload;
      applyPayload(payload);
      setMessage("บันทึก policy สำเร็จแล้ว");
    } catch {
      setError("บันทึก policy ไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const onReset = async () => {
    setError(null);
    setMessage(null);
    setIsResetting(true);

    try {
      const response = await fetch("/api/settings/team-policy", {
        method: "DELETE",
        headers: {
          "x-policy-actor": actorHeaderValue
        }
      });

      if (!response.ok) {
        throw new Error("reset failed");
      }

      const payload = (await response.json()) as TeamPolicyPayload;
      applyPayload(payload);
      setMessage("Reset policy สำเร็จแล้ว");
    } catch {
      setError("Reset policy ไม่สำเร็จ");
    } finally {
      setIsResetting(false);
    }
  };

  const onExport = () => {
    const payload = {
      lockEnabled,
      allowedTeamIds: allowedPreview
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "team-policy.export.json";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        lockEnabled?: unknown;
        allowedTeamIds?: unknown;
      };

      const importedAllowed = Array.isArray(parsed.allowedTeamIds)
        ? parsed.allowedTeamIds.filter((value): value is string => typeof value === "string")
        : [];

      setLockEnabled(Boolean(parsed.lockEnabled));
      setAllowedText(parseAllowedText(importedAllowed.join("\n")).join("\n"));
      setMessage("Import สำเร็จแล้ว กด Save Policy เพื่อบันทึกลง production");
      setError(null);
    } catch {
      setError("ไฟล์ import ไม่ถูกต้อง (ต้องเป็น JSON ที่มี allowedTeamIds)");
      setMessage(null);
    } finally {
      event.target.value = "";
    }
  };

  const formatAuditTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("th-TH", { hour12: false });
  };

  const onDownloadAudit = (format: "ndjson" | "csv") => {
    const params = new URLSearchParams();
    if (auditActorFilter.trim()) {
      params.set("actor", auditActorFilter.trim());
    }
    if (auditActionFilter) {
      params.set("action", auditActionFilter);
    }
    if (auditFromDate) {
      params.set("from", auditFromDate);
    }
    if (auditToDate) {
      params.set("to", auditToDate);
    }
    if (auditLimit.trim()) {
      params.set("limit", auditLimit.trim());
    }
    params.set("downloadAudit", "1");
    params.set("format", format);

    const href = `/api/settings/team-policy?${params.toString()}`;
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = format === "csv" ? "team-policy-audit.csv" : "team-policy-audit.ndjson";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="glass rounded-2xl p-5">
        <h1 className="font-[var(--font-sora)] text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-slate-200/85">Production Team Policy: เปิด lock แล้วจะอนุญาตเฉพาะทีมใน allowed list</p>
      </section>

      <section className="glass rounded-2xl p-5">
        {isLoading ? (
          <p className="text-sm text-slate-200/80">กำลังโหลด settings...</p>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={lockEnabled} onChange={(event) => setLockEnabled(event.target.checked)} />
              Enable allowed team lock (production)
            </label>

            <label className="block text-sm">
              Allowed Team IDs
              <textarea
                className="mt-1 min-h-40 w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm outline-none ring-cyan-300 transition focus:ring"
                value={allowedText}
                onChange={(event) => setAllowedText(event.target.value)}
                placeholder="TEAM-CHANTRAGREEN\nTEAM-OPS"
              />
            </label>

            <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-slate-200">
              <p className="font-medium text-cyan-100">Blocked Team IDs (always denied)</p>
              <p className="mt-1">{blockedTeamIds.join(", ") || "-"}</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-slate-200">
              <p className="font-medium text-cyan-100">Allowed Preview</p>
              <p className="mt-1">{allowedPreview.join(", ") || "(empty)"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDownloadAudit("ndjson")}
                className="rounded-xl border border-white/30 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100"
              >
                Download Audit Log (NDJSON)
              </button>
              <button
                type="button"
                onClick={() => onDownloadAudit("csv")}
                className="rounded-xl border border-white/30 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100"
              >
                Download Audit Log (CSV)
              </button>
              <button
                type="button"
                onClick={onExport}
                className="rounded-xl border border-white/30 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={onImportClick}
                className="rounded-xl border border-white/30 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100"
              >
                Import JSON
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={isResetting}
                className="rounded-xl border border-rose-300/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-100"
              >
                {isResetting ? "Resetting..." : "Reset Policy"}
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
            </div>

            {error && <p className="rounded-lg bg-rose-500/20 px-3 py-2 text-xs text-rose-100">{error}</p>}
            {message && <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-100">{message}</p>}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2 text-sm font-semibold text-ink"
            >
              {isSaving ? "Saving..." : "Save Policy"}
            </button>

            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              <p className="text-xs font-medium text-cyan-100">Policy Audit Log</p>

              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <input
                  className="rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-xs"
                  placeholder="Filter actor"
                  value={auditActorFilter}
                  onChange={(event) => setAuditActorFilter(event.target.value)}
                />
                <select
                  className="rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-xs"
                  value={auditActionFilter}
                  onChange={(event) => setAuditActionFilter(event.target.value as "" | "update" | "reset")}
                >
                  <option value="">All actions</option>
                  <option value="update">update</option>
                  <option value="reset">reset</option>
                </select>
                <input
                  type="date"
                  className="rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-xs"
                  value={auditFromDate}
                  onChange={(event) => setAuditFromDate(event.target.value)}
                />
                <input
                  type="date"
                  className="rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-xs"
                  value={auditToDate}
                  onChange={(event) => setAuditToDate(event.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  max={10000}
                  className="rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-xs"
                  value={auditLimit}
                  onChange={(event) => setAuditLimit(event.target.value)}
                  placeholder="limit"
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadPolicy}
                  className="rounded-lg border border-white/25 bg-white/5 px-3 py-1 text-xs"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuditActorFilter("");
                    setAuditActionFilter("");
                    setAuditFromDate("");
                    setAuditToDate("");
                    setAuditLimit("50");
                  }}
                  className="rounded-lg border border-white/25 bg-white/5 px-3 py-1 text-xs"
                >
                  Clear Filters
                </button>
                <span className="self-center text-[11px] text-slate-300/80">File retention: keep latest 10,000 lines</span>
              </div>

              {audit.length === 0 ? (
                <p className="mt-2 text-xs text-slate-300/80">ยังไม่มี audit log</p>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-left text-xs text-slate-100">
                    <thead>
                      <tr className="text-cyan-100/90">
                        <th className="px-2 py-1">Time</th>
                        <th className="px-2 py-1">Action</th>
                        <th className="px-2 py-1">Actor</th>
                        <th className="px-2 py-1">IP</th>
                        <th className="px-2 py-1">Lock</th>
                        <th className="px-2 py-1">Allowed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedAudit.map((entry, index) => (
                        <tr key={`${entry.ts}-${index}`} className="border-t border-white/10">
                          <td className="px-2 py-1">{formatAuditTime(entry.ts)}</td>
                          <td className="px-2 py-1 uppercase">{entry.action}</td>
                          <td className="px-2 py-1">{entry.actor}</td>
                          <td className="px-2 py-1">{entry.sourceIp}</td>
                          <td className="px-2 py-1">{entry.lockEnabled ? "on" : "off"}</td>
                          <td className="px-2 py-1">{entry.allowedTeamIds.join(", ") || "(empty)"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200/85">
                    <span>
                      Page {auditPage} / {auditTotalPages} ({audit.length} rows)
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1">
                        <span>Rows</span>
                        <select
                          className="rounded border border-white/20 bg-slate-950/40 px-2 py-1"
                          value={auditPageSize}
                          onChange={(event) => setAuditPageSize(Number(event.target.value))}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}
                        disabled={auditPage <= 1}
                        className="rounded border border-white/25 bg-white/5 px-2 py-1 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditPage((prev) => Math.min(auditTotalPages, prev + 1))}
                        disabled={auditPage >= auditTotalPages}
                        className="rounded border border-white/25 bg-white/5 px-2 py-1 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
