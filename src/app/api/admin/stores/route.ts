import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/stores?q=&category=&active=
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
    const category = req.nextUrl.searchParams.get("category");
    const active = req.nextUrl.searchParams.get("active");

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (category && category !== "ALL") where.category = category;
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    const stores = await db.store.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { orders: true, menuItems: true, drivers: true },
        },
      },
    });

    return NextResponse.json({
      stores: stores.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        category: s.category,
        logoUrl: s.logoUrl,
        ownerName: s.owner.name,
        ownerEmail: s.owner.email,
        ownerId: s.owner.id,
        isActive: s.isActive,
        isOpen: s.isOpen,
        rating: s.rating,
        deliveryFee: s.deliveryFee,
        minOrder: s.minOrder,
        pixKey: s.pixKey,
        paymentConnected: s.paymentConnected,
        createdAt: s.createdAt,
        ordersCount: s._count.orders,
        menuItemsCount: s._count.menuItems,
        driversCount: s._count.drivers,
      })),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
