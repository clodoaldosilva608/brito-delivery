import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stats?restaurantId=xxx
// Returns dashboard KPIs: today's orders, revenue, avg ticket, last 7 days trend, top products, status breakdown
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Today's orders
  const todayOrders = await db.order.findMany({
    where: { restaurantId, createdAt: { gte: todayStart } },
    include: { items: true, table: true },
  });

  // Last 7 days orders (for trend)
  const weekOrders = await db.order.findMany({
    where: { restaurantId, createdAt: { gte: sevenDaysAgo } },
    include: { items: true },
  });

  // Active orders (pending/preparing/ready)
  const activeOrders = await db.order.findMany({
    where: {
      restaurantId,
      status: { in: ["PENDING", "PREPARING", "READY"] },
    },
    include: { items: true, table: true },
    orderBy: { createdAt: "asc" },
  });

  // Today's reservations
  const todayDateStr = todayStart.toISOString().slice(0, 10);
  const todayReservations = await db.reservation.findMany({
    where: { restaurantId, date: todayDateStr },
    orderBy: { time: "asc" },
  });

  // Compute KPIs
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const avgTicket = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  // Daily breakdown for trend chart
  const dayMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { orders: 0, revenue: 0 });
  }
  for (const o of weekOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) {
      const entry = dayMap.get(key)!;
      entry.orders += 1;
      entry.revenue += o.total;
    }
  }

  const dailyTrend = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    label: new Date(date + "T00:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric" }),
    orders: v.orders,
    revenue: v.revenue,
  }));

  // Top products by quantity sold (last 7 days)
  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of weekOrders) {
    for (const it of o.items) {
      const existing = productSales.get(it.name) || { name: it.name, qty: 0, revenue: 0 };
      existing.qty += it.quantity;
      existing.revenue += it.unitPrice * it.quantity;
      productSales.set(it.name, existing);
    }
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Channel breakdown
  const channelMap = new Map<string, number>();
  for (const o of weekOrders) {
    channelMap.set(o.channel, (channelMap.get(o.channel) || 0) + 1);
  }
  const channelBreakdown = Array.from(channelMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  // Status breakdown (today)
  const statusMap = new Map<string, number>();
  for (const o of todayOrders) {
    statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
  }
  const statusBreakdown = Array.from(statusMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  // Total guests today from reservations
  const totalGuestsToday = todayReservations.reduce((s, r) => s + r.partySize, 0);

  return NextResponse.json({
    kpis: {
      todayOrdersCount: todayOrders.length,
      todayRevenue,
      avgTicket,
      activeOrdersCount: activeOrders.length,
      todayReservationsCount: todayReservations.length,
      totalGuestsToday,
    },
    dailyTrend,
    topProducts,
    channelBreakdown,
    statusBreakdown,
    activeOrders,
    todayReservations,
  });
}
