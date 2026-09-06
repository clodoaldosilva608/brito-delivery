import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string, isAdmin: boolean = false) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("FORBIDDEN");
  if (!isAdmin && store.ownerId !== ownerId) throw new Error("FORBIDDEN");
  return store;
}

const CreateItemSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Preço inválido"),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
});

// POST /api/my/stores/[id]/menu/items
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));

    const body = await req.json();
    const parsed = CreateItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Validar seção pertence à loja
    const section = await db.menuSection.findUnique({ where: { id: data.sectionId } });
    if (!section || section.storeId !== id) {
      return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
    }

    const lastPos = await db.menuItem.findFirst({
      where: { sectionId: data.sectionId },
      orderBy: { position: "desc" },
    });
    const position = (lastPos?.position ?? -1) + 1;

    const item = await db.menuItem.create({
      data: {
        sectionId: data.sectionId,
        storeId: id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        imageUrl: data.imageUrl || null,
        position,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    console.error("Create item error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
