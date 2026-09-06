import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || store.ownerId !== ownerId) throw new Error("FORBIDDEN");
}

// GET /api/my/stores/[id]/reports — relatório de vendas
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayOrders, weekOrders, allOrders] = await Promise.all([
      db.order.findMany({ where: { storeId: id, createdAt: { gte: todayStart } }, include: { items: true } }),
      db.order.findMany({ where: { storeId: id, createdAt: { gte: sevenDaysAgo } }, include: { items: true } }),
      db.order.findMany({ where: { storeId: id }, select: { total: true, status: true, createdAt: true, paymentMethod: true } }),
    ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
    const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);

    // Tendência 7 dias
    const dayMap = new Map<string, { orders: number; revenue: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { orders: 0, revenue: 0 });
    }
    for (const o of weekOrders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (dayMap.has(key)) {
        const e = dayMap.get(key)!;
        e.orders++;
        e.revenue += o.total;
      }
    }

    // Top produtos
    const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of weekOrders) {
      for (const it of o.items) {
        const existing = productSales.get(it.name) || { name: it.name, qty: 0, revenue: 0 };
        existing.qty += it.quantity;
        existing.revenue += it.unitPrice * it.quantity;
        productSales.set(it.name, existing);
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

    return NextResponse.json({
      kpis: {
        todayOrdersCount: todayOrders.length,
        todayRevenue,
        weekRevenue,
        totalRevenue,
        totalOrders: allOrders.length,
        avgTicket: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      },
      dailyTrend: Array.from(dayMap.entries()).map(([date, v]) => ({
        date,
        label: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
        ...v,
      })),
      topProducts: Array.from(productSales.values()).sort((a, b) => b.qty - a.qty).slice(0, 5),
      statusBreakdown: Array.from(statusMap.entries()).map(([name, count]) => ({ name, count })),
      paymentBreakdown: Array.from(paymentMap.entries()).map(([name, count]) => ({ name, count })),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
