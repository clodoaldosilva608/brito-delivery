import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || store.ownerId !== ownerId) throw new Error("FORBIDDEN");
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
          include: { items: { orderBy: { position: "asc" } } },
        },
        drivers: { orderBy: { createdAt: "desc" } },
        kitchenAreas: { orderBy: { position: "asc" } },
        members: { include: { profile: true } },
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
  // Básico
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  coverUrl: z.string().url().optional().or(z.literal("")).nullable(),
  // Endereço
  address: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  // Contato
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  // Redes sociais
  instagram: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  // Banners
  banners: z.string().optional().nullable(),
  // Horário
  openingHours: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
  // Entrega
  deliveryFee: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional(),
  avgDeliveryMin: z.number().int().min(5).max(180).optional(),
  deliveryActive: z.boolean().optional(),
  deliveryMode: z.enum(["FIXED", "BASE_KM", "AREAS"]).optional(),
  deliveryBaseFee: z.number().min(0).optional(),
  deliveryPerKm: z.number().min(0).optional(),
  deliveryMaxKm: z.number().min(0).optional(),
  freeDeliveryAbove: z.number().min(0).optional().nullable(),
  // Pagamento
  pixKey: z.string().optional().nullable(),
  paymentLink: z.string().url().optional().or(z.literal("")).nullable(),
  paymentGateway: z.string().optional().nullable(),
  paymentConnected: z.boolean().optional(),
  // Impressora
  printerMode: z.enum(["BROWSER", "PRINTNODE", "QZ"]).optional(),
  printerCopies: z.number().int().min(1).max(5).optional(),
  printerWidth: z.string().optional(),
  printerAutoPrint: z.boolean().optional(),
  printerAutoReport: z.boolean().optional(),
  // Mensagens auto
  autoMessagesEnabled: z.boolean().optional(),
  autoMessages: z.string().optional().nullable(),
  trackingText: z.string().optional().nullable(),
  // Domínio
  customDomain: z.string().optional().nullable(),
  domainVerified: z.boolean().optional(),
  // Trial
  trialEndsAt: z.string().optional().nullable(),
  // Estado
  isOpen: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/my/stores/[id] — atualizar loja (todas as seções)
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
        else if (k === "trialEndsAt" && v) cleaned[k] = new Date(v);
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
