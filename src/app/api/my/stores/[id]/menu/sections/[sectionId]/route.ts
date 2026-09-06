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

const UpdateSectionSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().optional(),
});

// PATCH /api/my/stores/[id]/menu/sections/[sectionId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { id, sectionId } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));

    const body = await req.json();
    const parsed = UpdateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const section = await db.menuSection.update({
      where: { id: sectionId },
      data: parsed.data,
    });
    return NextResponse.json({ section });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/my/stores/[id]/menu/sections/[sectionId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { id, sectionId } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));
    await db.menuSection.delete({ where: { id: sectionId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
