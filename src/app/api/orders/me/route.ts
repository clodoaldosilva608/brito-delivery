import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/orders/me — pedidos do cliente logado
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const status = req.nextUrl.searchParams.get("status");

    const where: any = { customerId: session.sub };
    if (status && status !== "ALL") where.status = status;

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        items: true,
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
