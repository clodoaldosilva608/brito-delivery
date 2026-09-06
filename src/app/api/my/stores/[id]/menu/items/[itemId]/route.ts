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

const UpdateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isAvailable: z.boolean().optional(),
  position: z.number().int().optional(),
  sectionId: z.string().optional(),
});

// PATCH /api/my/stores/[id]/menu/items/[itemId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await requireAuth();
    const { id, itemId } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));

    const body = await req.json();
    const parsed = UpdateItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }
    const data: any = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) {
        if (v === "") data[k] = null;
        else data[k] = v;
      }
    }

    const item = await db.menuItem.update({
      where: { id: itemId },
      data,
    });
    return NextResponse.json({ item });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/my/stores/[id]/menu/items/[itemId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await requireAuth();
    const { id, itemId } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));
    await db.menuItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
