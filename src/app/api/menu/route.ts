import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/menu?token=xxx - Get full menu for a table (or default restaurant)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  let restaurant;
  let table = null;

  if (token) {
    table = await db.table.findUnique({
      where: { qrToken: token },
      include: { restaurant: true },
    });
    if (table) {
      restaurant = table.restaurant;
    }
  }

  if (!restaurant) {
    // Fallback: pega o primeiro restaurante disponível
    restaurant = await db.restaurant.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 });
  }

  const categories = await db.category.findMany({
    where: { restaurantId: restaurant.id, isActive: true },
    orderBy: { position: "asc" },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { position: "asc" },
      },
    },
  });

  return NextResponse.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      primaryColor: restaurant.primaryColor,
      address: restaurant.address,
      phone: restaurant.phone,
      currency: restaurant.currency,
    },
    table: table
      ? { id: table.id, code: table.code, seats: table.seats, area: table.area }
      : null,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      products: c.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
        isVegan: p.isVegan,
        isSpicy: p.isSpicy,
        prepTimeMin: p.prepTimeMin,
      })),
    })),
  });
}
