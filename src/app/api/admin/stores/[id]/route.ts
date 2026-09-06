import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// PATCH /api/admin/stores/[id] — atualizar loja (ativar/desativar, editar dados)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { isActive, isOpen, name, category, deliveryFee, minOrder, pixKey, subscriptionStatus } = body;

    const update: any = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (isOpen !== undefined) update.isOpen = isOpen;
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (deliveryFee !== undefined) update.deliveryFee = deliveryFee;
    if (minOrder !== undefined) update.minOrder = minOrder;
    if (pixKey !== undefined) update.pixKey = pixKey;
    if (subscriptionStatus !== undefined) {
      update.subscriptionStatus = subscriptionStatus;
      if (subscriptionStatus === "BLOCKED") {
        update.isActive = false;
      } else if (subscriptionStatus === "SUBSCRIBER") {
        update.isActive = true;
      }
    }

    const store = await db.store.update({ where: { id }, data: update });
    return NextResponse.json({ store });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/admin/stores/[id] — excluir loja permanentemente
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.store.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
