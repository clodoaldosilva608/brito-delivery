import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/orders?restaurantId=xxx - list orders for restaurant
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  const status = req.nextUrl.searchParams.get("status");

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  }

  const where: any = { restaurantId };
  if (status && status !== "ALL") {
    where.status = status;
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: true,
      table: true,
    },
  });

  return NextResponse.json({ orders });
}

// POST /api/orders - create new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, tableId, items, customerName, notes, channel, tip } = body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate products and compute total
    const productIds = items.map((i: any) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, restaurantId },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.quantity) || 1));
      subtotal += product.price * qty;
      orderItemsData.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        notes: item.notes || null,
      });
    }

    const tipAmount = Math.max(0, parseFloat(tip) || 0);
    const total = subtotal + tipAmount;

    // Get next order number
    const lastOrder = await db.order.findFirst({
      where: { restaurantId },
      orderBy: { orderNumber: "desc" },
    });
    const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1;

    const order = await db.order.create({
      data: {
        restaurantId,
        tableId: tableId || null,
        orderNumber,
        status: "PENDING",
        channel: channel || "QR",
        customerName: customerName || null,
        notes: notes || null,
        subtotal,
        tip: tipAmount,
        total,
        items: { create: orderItemsData },
      },
      include: {
        items: true,
        table: true,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    console.error("Create order error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
