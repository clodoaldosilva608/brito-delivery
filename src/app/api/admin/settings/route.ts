import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/settings — configurações globais do sistema
export async function GET() {
  try {
    await requireAdmin();
    // Configurações derivadas dos dados do sistema
    const [totalStores, activeStores, totalUsers, trialStores, subscriberStores, blockedStores] = await Promise.all([
      db.store.count(),
      db.store.count({ where: { isActive: true } }),
      db.profile.count(),
      db.store.count({ where: { subscriptionStatus: "TRIAL" } }),
      db.store.count({ where: { subscriptionStatus: "SUBSCRIBER" } }),
      db.store.count({ where: { subscriptionStatus: "BLOCKED" } }),
    ]);

    return NextResponse.json({
      settings: {
        // Sistema
        platformName: "Brito",
        supportEmail: "suporte@brito.com",
        // Trial
        defaultTrialDays: 30,
        trialStoresCount: trialStores,
        // Assinaturas
        subscriberStoresCount: subscriberStores,
        blockedStoresCount: blockedStores,
        // Limites padrão
        defaultMaxStores: 1,
        defaultMaxMenuItems: 100,
        defaultDeliveryFee: 5.90,
        defaultMinOrder: 20.00,
        // Feature flags
        features: {
          enablePix: true,
          enableCard: true,
          enableOnDelivery: true,
          enableWhatsApp: false,
          enablePrintNode: false,
          enableQZTray: false,
          enable99Food: false,
          enableGami: false,
          enableCustomDomain: false,
          enableMultiStore: false,
          enableKDS: true,
          enableStock: true,
          enableReports: true,
          enableAutoMessages: false,
          enableBanners: true,
        },
        // Estatísticas
        stats: {
          totalStores,
          activeStores,
          totalUsers,
        },
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
