import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/orders/[id]/status - update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const validStatuses = ["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: { status },
    include: { items: true, table: true },
  });

  return NextResponse.json({ order });
}
