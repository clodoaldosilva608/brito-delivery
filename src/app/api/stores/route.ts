import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stores?q=xxx&category=xxx
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  const category = req.nextUrl.searchParams.get("category");

  const where: any = { isActive: true };
  if (category && category !== "all") {
    where.category = category;
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q } },
    ];
  }

  const stores = await db.store.findMany({
    where,
    orderBy: { rating: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      logoUrl: true,
      coverUrl: true,
      deliveryFee: true,
      minOrder: true,
      avgDeliveryMin: true,
      rating: true,
      isOpen: true,
    },
  });

  return NextResponse.json({ stores });
}
