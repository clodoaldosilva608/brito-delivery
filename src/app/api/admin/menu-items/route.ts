import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/menu-items?q=&storeId=
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
    const storeId = req.nextUrl.searchParams.get("storeId");

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (storeId && storeId !== "ALL") where.storeId = storeId;

    const items = await db.menuItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        store: { select: { id: true, name: true, slug: true } },
        section: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
