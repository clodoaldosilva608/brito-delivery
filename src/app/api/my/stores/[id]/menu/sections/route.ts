import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || store.ownerId !== ownerId) throw new Error("FORBIDDEN");
  return store;
}

const CreateSectionSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
});

// POST /api/my/stores/[id]/menu/sections
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub);

    const body = await req.json();
    const parsed = CreateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const lastPos = await db.menuSection.findFirst({
      where: { storeId: id },
      orderBy: { position: "desc" },
    });
    const position = (lastPos?.position ?? -1) + 1;

    const section = await db.menuSection.create({
      data: { storeId: id, name: parsed.data.name, position },
    });
    return NextResponse.json({ section }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
