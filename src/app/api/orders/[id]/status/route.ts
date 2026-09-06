import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { emitOrderEvent } from "@/lib/events";

const VALID_STATUSES = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

// PATCH /api/orders/[id]/status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Dono da loja ou ADMIN pode mudar status; cliente só pode CANCELAR (se ainda PENDING)
    const isAdmin = session.roles.includes("ADMIN");
    const isOwner = order.store.ownerId === session.sub || isAdmin;
    const isCustomer = order.customerId === session.sub;

    if (!isOwner && !isCustomer) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (isCustomer && !isOwner && status !== "CANCELLED") {
      return NextResponse.json({ error: "Você só pode cancelar pedidos" }, { status: 403 });
    }
    if (isCustomer && order.status !== "PENDING" && status === "CANCELLED") {
      return NextResponse.json(
        { error: "Não é mais possível cancelar este pedido" },
        { status: 400 }
      );
    }

    const updated = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true, store: true },
    });

    // Emitir mudança de status em tempo real para o cliente e a loja
    emitOrderEvent({
      type: "order:status",
      orderId: id,
      storeId: updated.storeId,
      customerId: updated.customerId,
      status,
      orderNumber: updated.orderNumber,
      customerName: updated.customerName,
      order: updated,
    });

    return NextResponse.json({ order: updated });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Update order status error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
