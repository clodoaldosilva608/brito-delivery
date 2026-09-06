import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/my/stores — lista lojas do dono logado
export async function GET() {
  try {
    const session = await requireAuth();
    const stores = await db.store.findMany({
      where: { ownerId: session.sub },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true, menuItems: true } },
      },
    });
    return NextResponse.json({ stores });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

const CreateStoreSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "Categoria obrigatória"),
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  coverUrl: z.string().url().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  deliveryFee: z.number().min(0).default(0),
  minOrder: z.number().min(0).default(0),
  avgDeliveryMin: z.number().int().min(5).max(180).default(30),
  pixKey: z.string().optional().nullable(),
  paymentLink: z.string().url().optional().or(z.literal("")).nullable(),
});

// POST /api/my/stores — criar loja
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = CreateStoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Garantir role OWNER
    await db.userRole.upsert({
      where: { profileId_role: { profileId: session.sub, role: "OWNER" } },
      update: {},
      create: { profileId: session.sub, role: "OWNER" },
    });

    // Gerar slug único
    let slug = slugify(data.name);
    const existing = await db.store.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const store = await db.store.create({
      data: {
        ownerId: session.sub,
        slug,
        name: data.name,
        description: data.description || null,
        category: data.category,
        logoUrl: data.logoUrl || null,
        coverUrl: data.coverUrl || null,
        address: data.address || null,
        cep: data.cep || null,
        phone: data.phone || null,
        openingHours: data.openingHours || null,
        deliveryFee: data.deliveryFee,
        minOrder: data.minOrder,
        avgDeliveryMin: data.avgDeliveryMin,
        pixKey: data.pixKey || null,
        paymentLink: data.paymentLink || null,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Create store error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
