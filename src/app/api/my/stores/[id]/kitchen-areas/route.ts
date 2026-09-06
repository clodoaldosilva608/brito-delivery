import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string, isAdmin: boolean = false) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("FORBIDDEN");
  if (!isAdmin && store.ownerId !== ownerId) throw new Error("FORBIDDEN");
}

const CreateAreaSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  color: z.string().default("#E85D2C"),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));
    const areas = await db.kitchenArea.findMany({
      where: { storeId: id },
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ areas });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));
    const body = await req.json();
    const parsed = CreateAreaSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    const lastPos = await db.kitchenArea.findFirst({ where: { storeId: id }, orderBy: { position: "desc" } });
    const area = await db.kitchenArea.create({
      data: { storeId: id, name: parsed.data.name, color: parsed.data.color, position: (lastPos?.position ?? -1) + 1 },
    });
    return NextResponse.json({ area }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
