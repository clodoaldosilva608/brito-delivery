import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/stores/[id]/detail — detalhe completo da loja
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const store = await db.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        subscriptionPlan: true,
        menuSections: {
          orderBy: { position: "asc" },
          include: {
            items: { orderBy: { position: "asc" } },
          },
        },
        drivers: { orderBy: { createdAt: "desc" } },
        kitchenAreas: { orderBy: { position: "asc" } },
        members: {
          include: {
            profile: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { items: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
    }

    // Calcular relatórios
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayOrders = store.orders.filter((o) => o.createdAt >= todayStart);
    const weekOrders = store.orders.filter((o) => o.createdAt >= sevenDaysAgo);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
    const totalRevenue = store.orders.reduce((s, o) => s + o.total, 0);

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const o of store.orders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    }

    // Payment breakdown
    const paymentBreakdown: Record<string, number> = {};
    for (const o of store.orders) {
      paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + 1;
    }

    // Top produtos
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const o of weekOrders) {
      for (const it of o.items) {
        if (!productSales[it.name]) productSales[it.name] = { name: it.name, qty: 0, revenue: 0 };
        productSales[it.name].qty += it.quantity;
        productSales[it.name].revenue += it.unitPrice * it.quantity;
      }
    }
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

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

    return NextResponse.json({
      store: {
        ...store,
        reports: {
          todayOrdersCount: todayOrders.length,
          todayRevenue,
          weekRevenue,
          totalRevenue,
          totalOrders: store.orders.length,
          avgTicket: store.orders.length > 0 ? totalRevenue / store.orders.length : 0,
          statusBreakdown: Object.entries(statusBreakdown).map(([name, count]) => ({ name, count })),
          paymentBreakdown: Object.entries(paymentBreakdown).map(([name, count]) => ({ name, count })),
          topProducts,
          dailyTrend: Array.from(dayMap.entries()).map(([date, v]) => ({
            date,
            label: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
            ...v,
          })),
        },
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    console.error("Admin store detail error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
