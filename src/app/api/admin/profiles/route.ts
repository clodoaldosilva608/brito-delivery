import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

// GET /api/admin/profiles?q=&role=
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
    const role = req.nextUrl.searchParams.get("role");

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const profiles = await db.profile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        roles: true,
        _count: {
          select: { stores: true, orders: true },
        },
      },
    });

    let filtered = profiles;
    if (role && role !== "ALL") {
      filtered = profiles.filter((p) => p.roles.some((r) => r.role === role));
    }

    return NextResponse.json({
      profiles: filtered.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        roles: p.roles.map((r) => r.role),
        createdAt: p.createdAt,
        storesCount: p._count.stores,
        ordersCount: p._count.orders,
      })),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/admin/profiles — criar novo usuário
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, email, phone, password, roles } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha obrigatórios" }, { status: 400 });
    }

    const existing = await db.profile.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const profile = await db.profile.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hash,
        roles: {
          create: (roles || ["CUSTOMER"]).map((r: string) => ({ role: r })),
        },
      },
      include: { roles: true },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    console.error("Admin create profile error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
