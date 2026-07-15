import { NextResponse } from "next/server";
import { mqttService } from "@/lib/server/mqtt-client";

export const runtime = "nodejs";

interface PublishBody {
  topic?: string;
  message?: string;
  qos?: number;
  retain?: boolean;
}

const toQos = (value: number | undefined): 0 | 1 | 2 => {
  if (value === 1 || value === 2) {
    return value;
  }

  return 0;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PublishBody;

  if (!body.topic || typeof body.message !== "string") {
    return NextResponse.json({ error: "Topic and message are required" }, { status: 400 });
  }

  mqttService.publish(body.topic, body.message, toQos(body.qos), body.retain ?? false);

  return NextResponse.json({ ok: true, topic: body.topic });
}
