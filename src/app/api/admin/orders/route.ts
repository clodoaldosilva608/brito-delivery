import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/orders?storeId=&status=&q=
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const storeId = req.nextUrl.searchParams.get("storeId");
    const status = req.nextUrl.searchParams.get("status");
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase();

    const where: any = {};
    if (storeId && storeId !== "ALL") where.storeId = storeId;
    if (status && status !== "ALL") where.status = status;
    if (q) {
      where.OR = [
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        store: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        items: true,
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
