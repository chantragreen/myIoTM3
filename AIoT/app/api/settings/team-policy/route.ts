import { NextResponse } from "next/server";
import {
  buildAuditCsvDownload,
  buildAuditLogDownload,
  getBlockedTeamIds,
  getTeamPolicy,
  TeamPolicyAuditQuery,
  getTeamPolicyAudit,
  resetTeamPolicy,
  updateTeamPolicy
} from "@/lib/server/team-policy";

export const runtime = "nodejs";

const buildMetadata = (request: Request) => ({
  actor: request.headers.get("x-policy-actor") ?? undefined,
  sourceIp: request.headers.get("x-forwarded-for") ?? undefined,
  userAgent: request.headers.get("user-agent") ?? undefined
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor") ?? undefined;
  const actionParam = searchParams.get("action");
  const action = actionParam === "update" || actionParam === "reset" ? actionParam : undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 50);
  const downloadAudit = searchParams.get("downloadAudit") === "1";
  const format = searchParams.get("format")?.toLowerCase() === "csv" ? "csv" : "ndjson";

  if (downloadAudit) {
    const query: TeamPolicyAuditQuery = {
      actor,
      action,
      from,
      to,
      limit: Number.isFinite(limit) ? limit : 10_000
    };

    const content = format === "csv" ? buildAuditCsvDownload(query) : buildAuditLogDownload(query);
    const dateSuffix = new Date().toISOString().slice(0, 10);
    const filename =
      format === "csv" ? `team-policy-audit-${dateSuffix}.csv` : `team-policy-audit-${dateSuffix}.ndjson`;

    return new Response(content, {
      headers: {
        "Content-Type":
          format === "csv" ? "text/csv; charset=utf-8" : "application/x-ndjson; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  }

  const policy = getTeamPolicy();
  return NextResponse.json({
    ...policy,
    blockedTeamIds: getBlockedTeamIds(),
    audit: getTeamPolicyAudit({
      actor,
      action,
      from,
      to,
      limit: Number.isFinite(limit) ? limit : 50
    })
  });
}

const savePolicyFromRequest = async (request: Request) => {
  const body = (await request.json()) as {
    lockEnabled?: unknown;
    allowedTeamIds?: unknown;
  };

  const allowedTeamIds = Array.isArray(body.allowedTeamIds)
    ? body.allowedTeamIds.filter((value): value is string => typeof value === "string")
    : [];

  const saved = updateTeamPolicy(
    {
      lockEnabled: Boolean(body.lockEnabled),
      allowedTeamIds
    },
    buildMetadata(request)
  );

  return NextResponse.json({
    ...saved,
    blockedTeamIds: getBlockedTeamIds(),
    audit: getTeamPolicyAudit({ limit: 50 })
  });
};

export async function PUT(request: Request) {
  return savePolicyFromRequest(request);
}

export async function POST(request: Request) {
  return savePolicyFromRequest(request);
}

export async function DELETE(request: Request) {
  const reset = resetTeamPolicy(buildMetadata(request));
  return NextResponse.json({
    ...reset,
    blockedTeamIds: getBlockedTeamIds(),
    audit: getTeamPolicyAudit({ limit: 50 })
  });
}
