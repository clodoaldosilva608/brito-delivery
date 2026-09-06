import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/reservations/[id]/status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const validStatuses = ["CONFIRMED", "SEATED", "CANCELLED", "NO_SHOW"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const reservation = await db.reservation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ reservation });
}
