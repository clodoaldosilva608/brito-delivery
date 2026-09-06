import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reservations?restaurantId=xxx&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  const date = req.nextUrl.searchParams.get("date");

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId obrigatório" }, { status: 400 });
  }

  const where: any = { restaurantId };
  if (date) where.date = date;

  const reservations = await db.reservation.findMany({
    where,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json({ reservations });
}

// POST /api/reservations - create reservation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      customerName,
      phone,
      email,
      partySize,
      date,
      time,
      occasion,
      notes,
    } = body;

    if (!restaurantId || !customerName || !phone || !partySize || !date || !time) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const reservation = await db.reservation.create({
      data: {
        restaurantId,
        customerName,
        phone,
        email: email || null,
        partySize: Math.max(1, Math.min(30, parseInt(partySize))),
        date,
        time,
        occasion: occasion || null,
        notes: notes || null,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (e: any) {
    console.error("Erro ao criar reserva:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
