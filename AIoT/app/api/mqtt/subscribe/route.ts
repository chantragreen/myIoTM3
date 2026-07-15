import { NextResponse } from "next/server";
import { mqttService } from "@/lib/server/mqtt-client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { topic?: string };

  if (!body.topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  mqttService.subscribe(body.topic);
  return NextResponse.json({ ok: true, topic: body.topic });
}
