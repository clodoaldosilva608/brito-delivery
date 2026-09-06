"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav, useSession, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import { Package, ChevronLeft, Clock, MapPin, Loader2, X } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Aguardando confirmação", color: "bg-accent/15 text-accent border-accent/30" },
  ACCEPTED: { label: "Aceito", color: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  PREPARING: { label: "Em preparo", color: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  OUT_FOR_DELIVERY: { label: "Saiu para entrega", color: "bg-primary/15 text-primary border-primary/30" },
  DELIVERED: { label: "Entregue", color: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelado", color: "bg-destructive/15 text-destructive border-destructive/30" },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "Pix",
  CARD: "Cartão",
  ON_DELIVERY: "Na entrega",
};

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  customerName: string;
  customerPhone: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  paymentMethod: string;
  paymentDetail: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  createdAt: string;
  items: { id: string; name: string; quantity: number; unitPrice: number; notes: string | null }[];
  store: { id: string; name: string; logoUrl: string | null; slug: string };
}

export function OrdersView() {
  const { setView } = useNav();
  const { profile, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/orders/me")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => toast.error("Erro ao carregar pedidos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!profile && !sessionLoading) {
      setView("auth");
      return;
    }
    if (profile) load();
     
  }, [profile, sessionLoading]);

  const cancel = async (id: string) => {
    setCancelling(id);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error("Erro ao cancelar");
      toast.success("Pedido cancelado");
      load();
    } catch (e: any) {
      toast.error("Não foi possível cancelar", { description: e.message });
    } finally {
      setCancelling(null);
    }
  };

  if (sessionLoading || (!profile && sessionLoading)) {
    return (
      <div className="container-brito py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao início
      </button>

      <h1 className="text-2xl font-bold mb-5">Meus pedidos</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">Você ainda não fez pedidos.</p>
          <Button onClick={() => setView("home")}>Explorar restaurantes</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {order.store.logoUrl ? (
                           
                          <img src={order.store.logoUrl} alt={order.store.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center font-bold">{order.store.name.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm">#{order.orderNumber} · {order.store.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${STATUS_CONFIG[order.status]?.color}`}>
                      {STATUS_CONFIG[order.status]?.label || order.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3 text-sm">
                    {order.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{it.quantity}× {it.name}</span>
                        <span>{formatBRL(it.unitPrice * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.street}, {order.number} - {order.neighborhood}
                      </span>
                      <span className="mt-0.5 block">Pagamento: {PAYMENT_LABELS[order.paymentMethod]}{order.paymentDetail ? ` (${order.paymentDetail})` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatBRL(order.total)}</span>
                      {order.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => cancel(order.id)}
                          disabled={cancelling === order.id}
                        >
                          {cancelling === order.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
