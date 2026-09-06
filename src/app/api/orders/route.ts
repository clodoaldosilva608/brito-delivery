import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { emitOrderEvent } from "@/lib/events";

const CreateOrderSchema = z.object({
  storeId: z.string().min(1),
  customerName: z.string().min(2, "Nome obrigatório"),
  customerPhone: z.string().min(8, "Telefone inválido"),
  cep: z.string().min(8, "CEP inválido"),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  paymentMethod: z.enum(["PIX", "CARD", "ON_DELIVERY"]),
  paymentDetail: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1).max(99),
      notes: z.string().optional().nullable(),
    })
  ).min(1, "Selecione ao menos 1 item"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Validar loja e itens
    const store = await db.store.findUnique({
      where: { id: data.storeId },
    });
    if (!store || !store.isActive) {
      return NextResponse.json({ error: "Loja indisponível" }, { status: 400 });
    }

    const items = await db.menuItem.findMany({
      where: {
        id: { in: data.items.map((i) => i.itemId) },
        storeId: store.id,
        isAvailable: true,
      },
    });
    if (items.length !== data.items.length) {
      return NextResponse.json(
        { error: "Um ou mais itens não estão disponíveis" },
        { status: 400 }
      );
    }

    const itemMap = new Map(items.map((it) => [it.id, it]));
    let subtotal = 0;
    const orderItemsData = data.items.map((i) => {
      const it = itemMap.get(i.itemId)!;
      subtotal += it.price * i.quantity;
      return {
        itemId: it.id,
        name: it.name,
        unitPrice: it.price,
        quantity: i.quantity,
        notes: i.notes || null,
      };
    });

    if (subtotal < store.minOrder) {
      return NextResponse.json(
        { error: `Pedido mínimo de R$ ${store.minOrder.toFixed(2)} não atingido` },
        { status: 400 }
      );
    }

    const total = subtotal + store.deliveryFee;

    const lastOrder = await db.order.findFirst({
      orderBy: { orderNumber: "desc" },
    });
    const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1;

    const order = await db.order.create({
      data: {
        storeId: store.id,
        customerId: session.sub,
        orderNumber,
        status: "PENDING",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        paymentMethod: data.paymentMethod,
        paymentDetail: data.paymentDetail || null,
        subtotal,
        deliveryFee: store.deliveryFee,
        total,
        notes: data.notes || null,
        items: { create: orderItemsData },
      },
      include: { items: true, store: true },
    });

    // Emitir evento de novo pedido em tempo real
    emitOrderEvent({
      type: "order:new",
      orderId: order.id,
      storeId: store.id,
      customerId: session.sub,
      status: "PENDING",
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      order,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Faça login para finalizar o pedido" }, { status: 401 });
    }
    console.error("Create order error:", e);
    return NextResponse.json({ error: e.message || "Erro interno" }, { status: 500 });
  }
}
