import { NextRequest, NextResponse } from "next/server";
import { createDevice, listDevices } from "@/lib/server/device-registry";
import { CreateDeviceInput } from "@/types/device";

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("teamId") || "TEAM-DEMO";
  const devices = listDevices(teamId);

  return NextResponse.json(devices);
}

export async function POST(request: NextRequest) {
  const teamId = request.headers.get("x-team-id") || "TEAM-DEMO";
  const body = (await request.json()) as Partial<CreateDeviceInput>;

  if (!body.name || !body.type || !body.macAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const record = createDevice(teamId, {
    name: body.name,
    type: body.type,
    macAddress: body.macAddress
  });

  return NextResponse.json(record, { status: 201 });
}
