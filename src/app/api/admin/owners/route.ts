import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/owners — listar todos os lojistas (donos de loja)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase();

    // Buscar todos os profiles que têm role OWNER
    const owners = await db.profile.findMany({
      where: {
        roles: { some: { role: "OWNER" } },
        ...(q ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        stores: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            subscriptionStatus: true,
            subscriptionEndsAt: true,
            isActive: true,
            subscriptionPlan: { select: { id: true, name: true, price: true } },
          },
        },
        memberships: {
          include: {
            profile: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      owners: owners.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        createdAt: o.createdAt,
        stores: o.stores,
        membersCount: o.memberships.length,
        totalStores: o.stores.length,
        activeStores: o.stores.filter((s) => s.isActive).length,
      })),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
