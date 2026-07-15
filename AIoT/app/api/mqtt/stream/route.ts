import { mqttService } from "@/lib/server/mqtt-client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || "team/+/+/+";

  mqttService.subscribe(topic);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const off = mqttService.onMessage((payload) => {
        if (payload.topic.includes(topic.replace("+", "")) || topic.includes("+")) {
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
