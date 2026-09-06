"use client";

import { useEffect, useRef } from "react";

interface OrderEvent {
  type: "order:new" | "order:status";
  orderId: string;
  storeId: string;
  customerId: string;
  status: string;
  orderNumber?: number;
  customerName?: string;
  order?: any;
}

/**
 * Hook que conecta ao SSE (Server-Sent Events) para receber
 * atualizações de pedidos em tempo real.
 * @param rooms Lista de rooms para escutar (ex: ["customer:xxx", "store:yyy"])
 * @param onEvent Callback chamado quando um evento chega
 */
export function useRealtimeOrders(
  rooms: string[],
  onEvent: (event: OrderEvent) => void
) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const roomsKey = rooms.join(",");

  useEffect(() => {
    if (rooms.length === 0) return;

    const url = `/api/realtime/stream?rooms=${encodeURIComponent(roomsKey)}`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const event: OrderEvent = JSON.parse(e.data);
        if (event.type && event.type !== "connected") {
          onEventRef.current(event);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource reconecta automaticamente
    };

    return () => {
      es.close();
    };
     
  }, [roomsKey]);
}
