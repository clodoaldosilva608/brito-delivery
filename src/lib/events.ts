import { EventEmitter } from "events";

// EventEmitter global compartilhado entre todas as API routes
const globalForEvents = globalThis as unknown as {
  __britoEmitter?: EventEmitter;
};

export const emitter: EventEmitter =
  globalForEvents.__britoEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.__britoEmitter = emitter;
}

// Configura limite de listeners para evitar warnings
emitter.setMaxListeners(100);

// Tipos de eventos
export interface OrderEvent {
  type: "order:new" | "order:status";
  orderId: string;
  storeId: string;
  customerId: string;
  status: string;
  orderNumber?: number;
  customerName?: string;
  order?: any;
}

export function emitOrderEvent(event: OrderEvent) {
  emitter.emit("order", event);
  // Também emite para rooms específicas
  emitter.emit(`store:${event.storeId}`, event);
  emitter.emit(`customer:${event.customerId}`, event);
}
