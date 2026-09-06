import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string, isAdmin: boolean = false) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("FORBIDDEN");
  if (!isAdmin && store.ownerId !== ownerId) throw new Error("FORBIDDEN");
}

// GET /api/my/stores/[id]/customers — clientes derivados de pedidos
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));

    // Agrupa pedidos por customerName+phone
    const orders = await db.order.findMany({
      where: { storeId: id },
      select: { customerName: true, customerPhone: true, total: true, createdAt: true, status: true },
      orderBy: { createdAt: "desc" },
    });

    const customersMap = new Map<string, { name: string; phone: string; ordersCount: number; totalSpent: number; lastOrder: Date }>();
    for (const o of orders) {
      const key = `${o.customerName}|${o.customerPhone}`;
      const existing = customersMap.get(key);
      if (existing) {
        existing.ordersCount++;
        existing.totalSpent += o.total;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        customersMap.set(key, {
          name: o.customerName,
          phone: o.customerPhone,
          ordersCount: 1,
          totalSpent: o.total,
          lastOrder: o.createdAt,
        });
      }
    }

    const customers = Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    return NextResponse.json({ customers });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
