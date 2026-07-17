import { mqttService } from "@/lib/server/mqtt-client";

export const runtime = "nodejs";

const mqttTopicMatches = (pattern: string, topic: string) => {
  const patternParts = pattern.split("/");
  const topicParts = topic.split("/");

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const topicPart = topicParts[index];

    if (patternPart === "#") {
      return true;
    }

    if (topicPart === undefined) {
      return false;
    }

    if (patternPart !== "+" && patternPart !== topicPart) {
      return false;
    }
  }

  return patternParts.length === topicParts.length;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || "team/+/#";

  mqttService.subscribe(topic);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const off = mqttService.onMessage((payload) => {
        if (mqttTopicMatches(topic, payload.topic)) {
          send(payload);
        }
      });

      send({ type: "connected", topic });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 25000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        off();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
