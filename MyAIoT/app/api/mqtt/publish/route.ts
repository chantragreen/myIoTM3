import { NextResponse } from "next/server";

import { publishMqttMessage } from "@/lib/mqtt";

export const runtime = "nodejs";

interface PublishRequestBody {
  topic?: string;
  payload?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as PublishRequestBody;
  const topic = body.topic?.trim();
  const payload = body.payload?.trim();

  if (!topic || !payload) {
    return NextResponse.json(
      {
        ok: false,
        error: "Both topic and payload are required.",
      },
      { status: 400 },
    );
  }

  if (topic.length > 180 || payload.length > 2_000) {
    return NextResponse.json(
      {
        ok: false,
        error: "Topic or payload exceeds the allowed size.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await publishMqttMessage(topic, payload);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to publish MQTT message.",
      },
      { status: 502 },
    );
  }
}