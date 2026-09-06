import { NextRequest } from "next/server";
import { emitter, type OrderEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

// GET /api/realtime/stream?rooms=store:xxx,customer:yyy
// Server-Sent Events endpoint para tempo real
export async function GET(req: NextRequest) {
  const roomsParam = req.nextUrl.searchParams.get("rooms") || "";
  const rooms = roomsParam.split(",").filter(Boolean);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Envia um evento inicial de conexão
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      // Listener para eventos de pedido
      const handler = (event: OrderEvent) => {
        // Se não especificou rooms, recebe tudo
        // Se especificou, só recebe se o evento for para um dos rooms
        const eventRooms = [`store:${event.storeId}`, `customer:${event.customerId}`];
        const shouldEmit = rooms.length === 0 || rooms.some((r) => eventRooms.includes(r));
        if (shouldEmit) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch {
            // stream closed
          }
        }
      };

      emitter.on("order", handler);

      // Heartbeat a cada 30s para manter a conexão viva
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // closed
        }
      }, 30000);

      // Cleanup quando o cliente desconecta
      req.signal.addEventListener("abort", () => {
        emitter.off("order", handler);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
