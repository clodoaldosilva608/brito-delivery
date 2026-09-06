"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNav, formatBRL } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft, Loader2, Clock, MapPin, CheckCircle2, Flame, Package, Truck, X,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string; nextLabel?: string; nextIcon?: any }> = {
  PENDING: { label: "Aguardando", color: "bg-accent/15 text-accent border-accent/30", next: "ACCEPTED", nextLabel: "Aceitar", nextIcon: CheckCircle2 },
  ACCEPTED: { label: "Aceito", color: "bg-chart-3/15 text-chart-3 border-chart-3/30", next: "PREPARING", nextLabel: "Iniciar preparo", nextIcon: Flame },
  PREPARING: { label: "Em preparo", color: "bg-chart-3/15 text-chart-3 border-chart-3/30", next: "OUT_FOR_DELIVERY", nextLabel: "Saiu para entrega", nextIcon: Truck },
  OUT_FOR_DELIVERY: { label: "A caminho", color: "bg-primary/15 text-primary border-primary/30", next: "DELIVERED", nextLabel: "Entregue", nextIcon: CheckCircle2 },
  DELIVERED: { label: "Entregue", color: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelado", color: "bg-destructive/15 text-destructive border-destructive/30" },
};

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "Pix",
  CARD: "Cartão",
  ON_DELIVERY: "Na entrega",
};

interface OrderT {
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
}

export function OwnerOrdersView() {
  const { activeStoreId, setView } = useNav();
  const [orders, setOrders] = useState<OrderT[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!activeStoreId) {
      setView("dashboard");
      return;
    }
    setLoading(true);
    fetch(`/api/orders/store?storeId=${activeStoreId}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [activeStoreId, setView]);

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Pedido marcado como ${STATUS_CONFIG[status]?.label}`);
      load();
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (tab === "active") return ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status);
    if (tab === "delivered") return o.status === "DELIVERED";
    if (tab === "cancelled") return o.status === "CANCELLED";
    return true;
  });

  return (
    <div className="container-brito py-6">
      <button
        onClick={() => setView("dashboard")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Voltar ao painel
      </button>

      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Pedidos da loja</h1>
          <p className="text-sm text-muted-foreground">Atualização automática a cada 15s</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="delivered">Entregues</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum pedido {tab === "active" ? "ativo" : tab === "delivered" ? "entregue" : "cancelado"}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order, idx) => {
            const cfg = STATUS_CONFIG[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className={order.status === "PENDING" ? "ring-2 ring-accent/40" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-bold">#{order.orderNumber}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>
                    </div>

                    <div className="text-sm font-medium mb-1">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground mb-2">{order.customerPhone}</div>
                    <div className="text-xs text-muted-foreground flex items-start gap-1 mb-2">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{order.street}, {order.number}{order.complement ? ` - ${order.complement}` : ""}<br />{order.neighborhood} - {order.city}</span>
                    </div>

                    <div className="space-y-1 mb-3 pt-2 border-t">
                      {order.items.map((it) => (
                        <div key={it.id} className="text-xs flex justify-between gap-2">
                          <span className="font-medium">{it.quantity}× {it.name}</span>
                        </div>
                      ))}
                      {order.notes && (
                        <div className="text-xs text-muted-foreground italic pt-1">Obs: {order.notes}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <Badge variant="secondary" className="text-[10px]">{PAYMENT_LABELS[order.paymentMethod]}{order.paymentDetail ? `: ${order.paymentDetail}` : ""}</Badge>
                      <span className="font-bold text-primary">{formatBRL(order.total)}</span>
                    </div>

                    {cfg?.next && (
                      <Button
                        size="sm"
                        className="w-full h-8"
                        onClick={() => updateStatus(order.id, cfg.next!)}
                        disabled={updating === order.id}
                      >
                        {updating === order.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <cfg.nextIcon className="h-3.5 w-3.5 mr-1" />}
                        {cfg.nextLabel}
                      </Button>
                    )}
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full h-7 mt-1 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        disabled={updating === order.id}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Recusar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
