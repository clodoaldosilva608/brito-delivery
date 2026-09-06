import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function ensureOwnedBy(storeId: string, ownerId: string) {
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store || store.ownerId !== ownerId) throw new Error("FORBIDDEN");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; driverId: string }> }
) {
  try {
    const session = await requireAuth();
    const { id, driverId } = await params;
    await ensureOwnedBy(id, session.sub);
    await db.deliveryDriver.delete({ where: { id: driverId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
