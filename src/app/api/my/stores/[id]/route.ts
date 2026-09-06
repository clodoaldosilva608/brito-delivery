import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || store.ownerId !== ownerId) {
    throw new Error("FORBIDDEN");
  }
  return store;
}

// GET /api/my/stores/[id] — detalhe com cardápio para edição
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const store = await ensureOwnedBy(id, session.sub);

    const full = await db.store.findUnique({
      where: { id },
      include: {
        menuSections: {
          orderBy: { position: "asc" },
          include: {
            items: { orderBy: { position: "asc" } },
          },
        },
      },
    });
    return NextResponse.json({ store: full });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

const UpdateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  coverUrl: z.string().url().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  deliveryFee: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional(),
  avgDeliveryMin: z.number().int().min(5).max(180).optional(),
  pixKey: z.string().optional().nullable(),
  paymentLink: z.string().url().optional().or(z.literal("")).nullable(),
  isOpen: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/my/stores/[id] — atualizar loja
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub);

    const body = await req.json();
    const parsed = UpdateStoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cleaned: any = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) {
        if (v === "") cleaned[k] = null;
        else cleaned[k] = v;
      }
    }

    const store = await db.store.update({
      where: { id },
      data: cleaned,
    });
    return NextResponse.json({ store });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    console.error("Update store error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/my/stores/[id] — desativar loja
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub);
    await db.store.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
