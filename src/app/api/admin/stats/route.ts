import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/stats — KPIs globais do sistema
export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProfiles,
      totalStores,
      activeStores,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      allOrders,
      totalMenuItems,
      totalDrivers,
    ] = await Promise.all([
      db.profile.count(),
      db.store.count(),
      db.store.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.findMany({ where: { createdAt: { gte: todayStart } }, select: { total: true } }),
      db.order.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { total: true, createdAt: true } }),
      db.order.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { total: true } }),
      db.order.findMany({ select: { total: true, status: true, paymentMethod: true, storeId: true, createdAt: true } }),
      db.menuItem.count(),
      db.deliveryDriver.count(),
    ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);

    // Tendência 14 dias
    const dayMap = new Map<string, { orders: number; revenue: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { orders: 0, revenue: 0 });
    }
    for (const o of allOrders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (dayMap.has(key)) {
        const e = dayMap.get(key)!;
        e.orders++;
        e.revenue += o.total;
      }
    }

    // Status breakdown
    const statusMap = new Map<string, number>();
    for (const o of allOrders) {
      statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
    }

    // Payment breakdown
    const paymentMap = new Map<string, number>();
    for (const o of allOrders) {
      paymentMap.set(o.paymentMethod, (paymentMap.get(o.paymentMethod) || 0) + 1);
    }

    // Top lojas por receita
    const storeRevenueMap = new Map<string, { storeId: string; revenue: number; orders: number }>();
    for (const o of allOrders) {
      const existing = storeRevenueMap.get(o.storeId) || { storeId: o.storeId, revenue: 0, orders: 0 };
      existing.revenue += o.total;
      existing.orders++;
      storeRevenueMap.set(o.storeId, existing);
    }
    const topStoreIds = Array.from(storeRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((s) => s.storeId);
    const topStoresData = await db.store.findMany({
      where: { id: { in: topStoreIds } },
      select: { id: true, name: true, logoUrl: true },
    });
    const topStores = topStoreIds.map((id) => {
      const data = topStoresData.find((s) => s.id === id)!;
      const stats = storeRevenueMap.get(id)!;
      return { ...data, ...stats };
    });

    // Novos usuários (últimos 7 dias)
    const newProfiles = await db.profile.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    const newStores = await db.store.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    return NextResponse.json({
      kpis: {
        totalProfiles,
        totalStores,
        activeStores,
        totalOrders,
        todayOrdersCount: todayOrders.length,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalRevenue,
        totalMenuItems,
        totalDrivers,
        newProfilesThisWeek: newProfiles,
        newStoresThisWeek: newStores,
        avgTicket: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      },
      dailyTrend: Array.from(dayMap.entries()).map(([date, v]) => ({
        date,
        label: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        ...v,
      })),
      statusBreakdown: Array.from(statusMap.entries()).map(([name, count]) => ({ name, count })),
      paymentBreakdown: Array.from(paymentMap.entries()).map(([name, count]) => ({ name, count })),
      topStores,
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    console.error("Admin stats error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
