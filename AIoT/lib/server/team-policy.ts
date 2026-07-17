import fs from "node:fs";
import path from "node:path";

export interface TeamPolicy {
  lockEnabled: boolean;
  allowedTeamIds: string[];
}

export interface TeamPolicyAuditEntry {
  ts: string;
  action: "update" | "reset";
  actor: string;
  sourceIp: string;
  userAgent: string;
  lockEnabled: boolean;
  allowedTeamIds: string[];
}

export interface TeamPolicyAuditQuery {
  actor?: string;
  action?: TeamPolicyAuditEntry["action"];
  from?: string;
  to?: string;
  limit?: number;
}

const BLOCKED_TEAM_IDS: string[] = ["TEAM-DEMO"];
const POLICY_FILE = path.join(process.cwd(), "deploy", "team-policy.json");
const POLICY_AUDIT_FILE = path.join(process.cwd(), "deploy", "team-policy-audit.log");
const POLICY_AUDIT_MAX_LINES = 10_000;

let cache: TeamPolicy | null = null;

const normalizeTeamId = (value: string) => value.trim().toUpperCase();

const uniqueTeamIds = (values: string[]) => {
  const set = new Set<string>();
  for (const value of values) {
    const normalized = normalizeTeamId(value);
    if (normalized) {
      set.add(normalized);
    }
  }

  return Array.from(set.values()).sort();
};

const parseAllowedTeamIdsEnv = () => {
  const raw = process.env.ALLOWED_TEAM_IDS ?? "";
  if (!raw.trim()) {
    return [];
  }

  return uniqueTeamIds(raw.split(","));
};

const loadPolicyFromDisk = (): TeamPolicy | null => {
  try {
    const raw = fs.readFileSync(POLICY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { lockEnabled?: unknown; allowedTeamIds?: unknown };

    return {
      lockEnabled: Boolean(parsed.lockEnabled),
      allowedTeamIds: Array.isArray(parsed.allowedTeamIds)
        ? uniqueTeamIds(parsed.allowedTeamIds.filter((value): value is string => typeof value === "string"))
        : []
    };
  } catch {
    return null;
  }
};

const buildDefaultPolicy = (): TeamPolicy => {
  const allowedTeamIds = parseAllowedTeamIdsEnv();
  const lockFromEnv = process.env.TEAM_POLICY_LOCK === "1";

  return {
    lockEnabled: lockFromEnv || (process.env.NODE_ENV === "production" && allowedTeamIds.length > 0),
    allowedTeamIds
  };
};

const savePolicyToDisk = (policy: TeamPolicy) => {
  const dir = path.dirname(POLICY_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(POLICY_FILE, JSON.stringify(policy, null, 2));
};

const appendAuditToDisk = (entry: TeamPolicyAuditEntry) => {
  const dir = path.dirname(POLICY_AUDIT_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(POLICY_AUDIT_FILE, `${JSON.stringify(entry)}\n`);
  enforceAuditRetention(POLICY_AUDIT_MAX_LINES);
};

const enforceAuditRetention = (maxLines: number) => {
  try {
    const content = fs.readFileSync(POLICY_AUDIT_FILE, "utf-8");
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length <= maxLines) {
      return;
    }

    const trimmed = lines.slice(lines.length - maxLines);
    fs.writeFileSync(POLICY_AUDIT_FILE, `${trimmed.join("\n")}\n`);
  } catch {
    // Ignore retention failures and keep append path non-blocking.
  }
};

const sanitizeActor = (value?: string) => {
  const raw = (value ?? "").trim();
  return raw || "unknown";
};

const sanitizeSourceIp = (value?: string) => {
  const raw = (value ?? "").trim();
  return raw || "unknown";
};

const sanitizeUserAgent = (value?: string) => {
  const raw = (value ?? "").trim();
  return raw || "unknown";
};

const writeAudit = (
  action: TeamPolicyAuditEntry["action"],
  policy: TeamPolicy,
  metadata?: { actor?: string; sourceIp?: string; userAgent?: string }
) => {
  appendAuditToDisk({
    ts: new Date().toISOString(),
    action,
    actor: sanitizeActor(metadata?.actor),
    sourceIp: sanitizeSourceIp(metadata?.sourceIp),
    userAgent: sanitizeUserAgent(metadata?.userAgent),
    lockEnabled: Boolean(policy.lockEnabled),
    allowedTeamIds: uniqueTeamIds(policy.allowedTeamIds)
  });
};

export const getBlockedTeamIds = () => Array.from(BLOCKED_TEAM_IDS);

export const getTeamPolicy = (): TeamPolicy => {
  if (cache) {
    return cache;
  }

  cache = loadPolicyFromDisk() ?? buildDefaultPolicy();
  return cache;
};

export const updateTeamPolicy = (
  policy: TeamPolicy,
  metadata?: { actor?: string; sourceIp?: string; userAgent?: string }
) => {
  const normalized: TeamPolicy = {
    lockEnabled: Boolean(policy.lockEnabled),
    allowedTeamIds: uniqueTeamIds(policy.allowedTeamIds)
  };

  cache = normalized;
  savePolicyToDisk(normalized);
  writeAudit("update", normalized, metadata);
  return normalized;
};

export const resetTeamPolicy = (metadata?: { actor?: string; sourceIp?: string; userAgent?: string }) => {
  const defaults = buildDefaultPolicy();
  cache = defaults;
  savePolicyToDisk(defaults);
  writeAudit("reset", defaults, metadata);
  return defaults;
};

const readAuditEntries = (): TeamPolicyAuditEntry[] => {
  try {
    const content = fs.readFileSync(POLICY_AUDIT_FILE, "utf-8");
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines
      .map((line) => {
        try {
          return JSON.parse(line) as TeamPolicyAuditEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is TeamPolicyAuditEntry => Boolean(entry));
  } catch {
    return [];
  }
};

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const getTeamPolicyAudit = (query: TeamPolicyAuditQuery = {}): TeamPolicyAuditEntry[] => {
  const actorFilter = query.actor?.trim().toUpperCase() ?? "";
  const actionFilter = query.action;
  const fromDate = parseDate(query.from);
  const toDate = parseDate(query.to);
  const limit = Math.max(1, Math.min(10_000, query.limit ?? 100));

  const filtered = readAuditEntries().filter((entry) => {
    if (actorFilter && !entry.actor.toUpperCase().includes(actorFilter)) {
      return false;
    }

    if (actionFilter && entry.action !== actionFilter) {
      return false;
    }

    const entryDate = new Date(entry.ts);
    if (fromDate && entryDate < fromDate) {
      return false;
    }

    if (toDate) {
      const toDateEnd = new Date(toDate);
      toDateEnd.setHours(23, 59, 59, 999);
      if (entryDate > toDateEnd) {
        return false;
      }
    }

    return true;
  });

  return filtered.slice(-limit).reverse();
};

export const buildAuditLogDownload = (query: TeamPolicyAuditQuery = {}) => {
  const entries = getTeamPolicyAudit({ ...query, limit: query.limit ?? 10_000 });
  const content = entries.map((entry) => JSON.stringify(entry)).join("\n");
  return `${content}${content ? "\n" : ""}`;
};

const escapeCsvValue = (value: string) => {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

export const buildAuditCsvDownload = (query: TeamPolicyAuditQuery = {}) => {
  const entries = getTeamPolicyAudit({ ...query, limit: query.limit ?? 10_000 });
  const header = ["ts", "action", "actor", "sourceIp", "userAgent", "lockEnabled", "allowedTeamIds"];
  const rows = entries.map((entry) => {
    const cols = [
      entry.ts,
      entry.action,
      entry.actor,
      entry.sourceIp,
      entry.userAgent,
      entry.lockEnabled ? "true" : "false",
      entry.allowedTeamIds.join("|")
    ];

    return cols.map((col) => escapeCsvValue(col)).join(",");
  });

  const content = [header.join(","), ...rows].join("\n");
  return `${content}\n`;
};

export const isTeamAllowed = (teamId: string, policy = getTeamPolicy()) => {
  const normalized = normalizeTeamId(teamId);
  if (!normalized) {
    return false;
  }

  if (getBlockedTeamIds().includes(normalized)) {
    return false;
  }

  if (!policy.lockEnabled) {
    return true;
  }

  if (policy.allowedTeamIds.length === 0) {
    return false;
  }

  return policy.allowedTeamIds.includes(normalized);
};
