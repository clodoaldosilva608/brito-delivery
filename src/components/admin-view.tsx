"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNav, formatCOP } from "@/lib/store";
import { toast } from "sonner";
import {
  TrendingUp, Wallet, ShoppingBag, Users, Clock, ChefHat,
  CheckCircle2, BellRing, CalendarClock, Loader2, ChevronLeft,
  Flame, Check, X,
} from "lucide-react";

interface Stats {
  kpis: {
    todayOrdersCount: number;
    todayRevenue: number;
    avgTicket: number;
    activeOrdersCount: number;
    todayReservationsCount: number;
    totalGuestsToday: number;
  };
  dailyTrend: { date: string; label: string; orders: number; revenue: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  channelBreakdown: { name: string; count: number }[];
  statusBreakdown: { name: string; count: number }[];
  activeOrders: any[];
  todayReservations: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string }> = {
  PENDING: { label: "Pendiente", color: "bg-chart-4/15 text-chart-4 border-chart-4/30", next: "PREPARING" },
  PREPARING: { label: "Preparando", color: "bg-chart-3/15 text-chart-3 border-chart-3/30", next: "READY" },
  READY: { label: "Listo", color: "bg-chart-2/15 text-chart-2 border-chart-2/30", next: "DELIVERED" },
  DELIVERED: { label: "Entregado", color: "bg-muted text-muted-foreground border-border", next: undefined },
  CANCELLED: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/30", next: undefined },
};

const PIE_COLORS = ["#E85D2C", "#2D8B5B", "#7C5BC7", "#D4A028", "#C73E1D"];

export function AdminView() {
  const { setView, restaurantId, setRestaurantId } = useNav();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let rid = restaurantId;
    if (!rid) {
      // fetch default restaurant id
      const r = await fetch("/api/menu").then((r) => r.json());
      rid = r.restaurant.id;
      setRestaurantId(rid);
    }
    const res = await fetch(`/api/stats?restaurantId=${rid}`);
    const data = await res.json();
    setStats(data);
  }, [restaurantId, setRestaurantId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // Auto refresh every 20s
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      load().finally(() => setRefreshing(false));
    }, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      toast.success(`Pedido marcado como ${STATUS_CONFIG[status]?.label}`);
      await load();
    } catch (e: any) {
      toast.error("No se pudo actualizar", { description: e.message });
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error");
      toast.success("Reserva actualizada");
      await load();
    } catch {
      toast.error("No se pudo actualizar la reserva");
    }
  };

  if (loading || !stats) {
    return (
      <div className="container-cluvi py-20 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando dashboard…</p>
      </div>
    );
  }

  const { kpis } = stats;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container-cluvi py-6">
        <button
          onClick={() => setView("home")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </button>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              Dashboard
              {refreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h1>
            <p className="text-sm text-muted-foreground">
              El Balcón del Chef · Actualización automática cada 20s
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }}>
            Refrescar
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard
            icon={Wallet}
            label="Ventas hoy"
            value={formatCOP(kpis.todayRevenue)}
            color="text-primary"
            bg="bg-primary/10"
          />
          <KpiCard
            icon={ShoppingBag}
            label="Pedidos hoy"
            value={String(kpis.todayOrdersCount)}
            color="text-chart-2"
            bg="bg-chart-2/10"
          />
          <KpiCard
            icon={TrendingUp}
            label="Ticket prom."
            value={formatCOP(kpis.avgTicket)}
            color="text-chart-3"
            bg="bg-chart-3/10"
          />
          <KpiCard
            icon={BellRing}
            label="Pedidos activos"
            value={String(kpis.activeOrdersCount)}
            color="text-chart-4"
            bg="bg-chart-4/10"
          />
          <KpiCard
            icon={CalendarClock}
            label="Reservas hoy"
            value={String(kpis.todayReservationsCount)}
            color="text-chart-5"
            bg="bg-chart-5/10"
          />
          <KpiCard
            icon={Users}
            label="Comensales"
            value={String(kpis.totalGuestsToday)}
            color="text-primary"
            bg="bg-primary/10"
          />
        </div>

        {/* Tabs: Órdenes | Reservas | Analítica */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="orders">Pedidos activos</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="analytics">Analítica</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Pantalla de cocina (KDS)
                </CardTitle>
                <CardDescription>
                  Pedidos en preparación. Avanza el estado con un clic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.activeOrders.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-chart-2/50" />
                    No hay pedidos pendientes. ¡Todo al día!
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {stats.activeOrders.map((order, idx) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border rounded-xl p-4 bg-card"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-bold text-sm">#{order.orderNumber}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {order.table ? `Mesa ${order.table.code}` : order.channel === "DELIVERY" ? "Domicilio" : "Para llevar"}
                              {order.customerName && ` · ${order.customerName}`}
                            </div>
                          </div>
                          <Badge className={`text-[10px] ${STATUS_CONFIG[order.status]?.color}`}>
                            {STATUS_CONFIG[order.status]?.label}
                          </Badge>
                        </div>
                        <div className="space-y-1.5 mb-3">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="text-xs flex justify-between gap-2">
                              <span className="font-medium">{item.quantity}× {item.name}</span>
                              {item.notes && <span className="text-muted-foreground italic">({item.notes})</span>}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="font-bold text-foreground">{formatCOP(order.total)}</span>
                        </div>
                        {STATUS_CONFIG[order.status]?.next && (
                          <Button
                            size="sm"
                            className="w-full h-8"
                            onClick={() => updateOrderStatus(order.id, STATUS_CONFIG[order.status].next!)}
                          >
                            {order.status === "PENDING" && <><Flame className="h-3 w-3 mr-1" /> Empezar a preparar</>}
                            {order.status === "PREPARING" && <><Check className="h-3 w-3 mr-1" /> Marcar listo</>}
                            {order.status === "READY" && <><CheckCircle2 className="h-3 w-3 mr-1" /> Entregar</>}
                          </Button>
                        )}
                        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full h-7 mt-1 text-xs text-muted-foreground"
                            onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                          >
                            <X className="h-3 w-3 mr-1" /> Cancelar
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RESERVATIONS TAB */}
          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Reservas de hoy
                </CardTitle>
                <CardDescription>{stats.todayReservations.length} reservas · {kpis.totalGuestsToday} comensales</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.todayReservations.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No hay reservas para hoy.
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {stats.todayReservations.map((r, idx) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`border rounded-xl p-3 flex items-center gap-3 ${
                          r.status === "SEATED" ? "bg-chart-2/5 border-chart-2/30" :
                          r.status === "CANCELLED" ? "bg-destructive/5 border-destructive/30 opacity-60" :
                          "bg-card"
                        }`}
                      >
                        <div className="text-center shrink-0">
                          <div className="text-xs text-muted-foreground">Hora</div>
                          <div className="font-bold text-sm">{r.time}</div>
                        </div>
                        <div className="w-px h-10 bg-border" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{r.customerName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Users className="h-3 w-3" /> {r.partySize} pers.
                            {r.occasion && <span className="text-primary">· {r.occasion}</span>}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{r.phone}</div>
                        </div>
                        {r.status === "CONFIRMED" ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateReservationStatus(r.id, "SEATED")}>
                            <Check className="h-3 w-3 mr-1" /> Sentar
                          </Button>
                        ) : r.status === "SEATED" ? (
                          <Badge className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/30">Sentado</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">{r.status}</Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Revenue trend */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ventas últimos 7 días</CardTitle>
                  <CardDescription>Ingresos y número de pedidos por día</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.dailyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E85D2C" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#E85D2C" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2D8B5B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2D8B5B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#888" />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#888" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#888" />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                          formatter={(v: any, name: any) =>
                            name === "revenue" ? [formatCOP(Number(v)), "Ingresos"] : [`${v} pedidos`, "Pedidos"]
                          }
                        />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#E85D2C" strokeWidth={2} fill="url(#colorRevenue)" />
                        <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#2D8B5B" strokeWidth={2} fill="url(#colorOrders)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Channel breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Canales</CardTitle>
                  <CardDescription>Origen de pedidos (7 días)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.channelBreakdown}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {stats.channelBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                          formatter={(v: any) => [`${v} pedidos`, "Total"]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          wrapperStyle={{ fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Top products */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top 5 productos</CardTitle>
                  <CardDescription>Más vendidos en los últimos 7 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.topProducts}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#888" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          stroke="#888"
                          width={100}
                          tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + "…" : v}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                          formatter={(v: any) => [`${v} unidades`, "Vendidas"]}
                        />
                        <Bar dataKey="qty" fill="#E85D2C" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Estado de pedidos (hoy)</CardTitle>
                  <CardDescription>Distribución por estado actual</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.statusBreakdown.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      Sin datos aún hoy.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.statusBreakdown.map((s, i) => {
                        const total = stats.statusBreakdown.reduce((acc, x) => acc + x.count, 0);
                        const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                        return (
                          <div key={s.name}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-medium">{STATUS_CONFIG[s.name]?.label || s.name}</span>
                              <span className="text-muted-foreground">{s.count} · {pct}%</span>
                            </div>
                            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: i * 0.08, duration: 0.6 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className={`grid place-items-center h-9 w-9 rounded-lg ${bg} ${color} mb-2`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg md:text-xl font-bold leading-tight mt-0.5">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
