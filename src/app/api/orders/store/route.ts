import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/orders/store?storeId=xxx&status=xxx
// Lista pedidos de uma loja do dono logado
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const storeId = req.nextUrl.searchParams.get("storeId");
    const status = req.nextUrl.searchParams.get("status");

    if (!storeId) {
      return NextResponse.json({ error: "storeId obrigatório" }, { status: 400 });
    }

    // Verificar posse
    const store = await db.store.findUnique({ where: { id: storeId } });
    if (!store || store.ownerId !== session.sub) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const where: any = { storeId };
    if (status && status !== "ALL") where.status = status;

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { items: true },
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
