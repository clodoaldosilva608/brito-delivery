import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/tables?restaurantId=xxx
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  }

  const tables = await db.table.findMany({
    where: { restaurantId, isActive: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ tables });
}
