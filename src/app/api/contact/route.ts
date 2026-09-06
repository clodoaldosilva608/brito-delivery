import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/contact - submit contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, restaurantName, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const msg = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        restaurantName: restaurantName || null,
        message,
      },
    });

    return NextResponse.json({ success: true, id: msg.id }, { status: 201 });
  } catch (e: any) {
    console.error("Contact error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
