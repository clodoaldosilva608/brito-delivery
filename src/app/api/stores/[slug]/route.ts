import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stores/[slug] — detalhe da loja com cardápio
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const store = await db.store.findUnique({
    where: { slug },
    include: {
      menuSections: {
        orderBy: { position: "asc" },
        include: {
          items: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!store || !store.isActive) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    store: {
      id: store.id,
      slug: store.slug,
      name: store.name,
      description: store.description,
      category: store.category,
      logoUrl: store.logoUrl,
      coverUrl: store.coverUrl,
      address: store.address,
      phone: store.phone,
      openingHours: store.openingHours,
      deliveryFee: store.deliveryFee,
      minOrder: store.minOrder,
      avgDeliveryMin: store.avgDeliveryMin,
      rating: store.rating,
      isOpen: store.isOpen,
      pixKey: store.pixKey,
      paymentLink: store.paymentLink,
      menuSections: store.menuSections.map((s) => ({
        id: s.id,
        name: s.name,
        items: s.items.map((it) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          price: it.price,
          imageUrl: it.imageUrl,
          isAvailable: it.isAvailable,
        })),
      })),
    },
  });
}
