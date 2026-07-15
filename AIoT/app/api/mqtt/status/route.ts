import { NextResponse } from "next/server";
import { mqttService } from "@/lib/server/mqtt-client";

export const runtime = "nodejs";

export async function GET() {
  mqttService.connect();
  return NextResponse.json(mqttService.status());
}
