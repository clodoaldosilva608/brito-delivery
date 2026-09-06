import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string, isAdmin: boolean = false) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("FORBIDDEN");
  if (!isAdmin && store.ownerId !== ownerId) throw new Error("FORBIDDEN");
}

const CreateDriverSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(8, "Telefone inválido"),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await ensureOwnedBy(id, session.sub, session.roles.includes("ADMIN"));
    const drivers = await db.deliveryDriver.findMany({
      where: { storeId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ drivers });
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
    const parsed = CreateDriverSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    const driver = await db.deliveryDriver.create({
      data: { storeId: id, name: parsed.data.name, phone: parsed.data.phone },
    });
    return NextResponse.json({ driver }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
