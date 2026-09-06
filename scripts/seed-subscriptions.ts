// scripts/seed-subscriptions.ts
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Criando planos de assinatura...");

  // Criar planos
  const plans = [
    {
      name: "Starter",
      description: "Para restaurantes começando com delivery online",
      price: 49.90,
      billingCycle: "MONTHLY",
      features: JSON.stringify(["Cardápio digital", "Pedidos via QR", "1 loja", "Até 50 itens", "Suporte por email"]),
      isActive: true,
      maxStores: 1,
      maxMenuItems: 50,
    },
    {
      name: "Professional",
      description: "Para restaurantes estabelecidos com volume médio",
      price: 99.90,
      billingCycle: "MONTHLY",
      features: JSON.stringify(["Tudo do Starter", "Pedidos ilimitados", "Multi-entregadores", "Relatórios avançados", "Mensagens WhatsApp auto", "Impressão automática", "Suporte prioritário"]),
      isActive: true,
      maxStores: 1,
      maxMenuItems: 200,
    },
    {
      name: "Enterprise",
      description: "Para redes e franquias com múltiplas lojas",
      price: 249.90,
      billingCycle: "MONTHLY",
      features: JSON.stringify(["Tudo do Professional", "Multi-lojas (até 5)", "Itens ilimitados", "Domínio próprio", "Integrações (99Food, Gami)", "API access", "Gerente de conta dedicado", "Suporte 24/7"]),
      isActive: true,
      maxStores: 5,
      maxMenuItems: 1000,
    },
  ];

  for (const p of plans) {
    await db.subscriptionPlan.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }
  console.log(`✓ ${plans.length} planos criados`);

  // Atribuir status de assinatura às lojas existentes
  const stores = await db.store.findMany();
  const starterPlan = await db.subscriptionPlan.findUnique({ where: { name: "Starter" } });
  const proPlan = await db.subscriptionPlan.findUnique({ where: { name: "Professional" } });
  const entPlan = await db.subscriptionPlan.findUnique({ where: { name: "Enterprise" } });

  const now = new Date();
  const statuses = [
    { storeIdx: 0, status: "TRIAL", plan: null, endsAt: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000) }, // Pizza Forneiro - trial 18 dias restantes
    { storeIdx: 1, status: "SUBSCRIBER", plan: proPlan, endsAt: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000) }, // Burger Vila - assinante, 22 dias restantes
    { storeIdx: 2, status: "SUBSCRIBER", plan: entPlan, endsAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000) }, // Sushi Tanaka - enterprise, 45 dias
    { storeIdx: 3, status: "TRIAL", plan: null, endsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) }, // Doceria Mel - trial 5 dias restantes
    { storeIdx: 4, status: "BLOCKED", plan: null, endsAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }, // Verde Saudável - bloqueada (trial expirado)
  ];

  for (const s of statuses) {
    if (!stores[s.storeIdx]) continue;
    await db.store.update({
      where: { id: stores[s.storeIdx].id },
      data: {
        subscriptionStatus: s.status,
        subscriptionPlanId: s.plan?.id || null,
        subscriptionEndsAt: s.endsAt,
        trialEndsAt: s.status === "TRIAL" ? s.endsAt : null,
      },
    });
  }
  console.log(`✓ ${statuses.length} lojas atualizadas com status de assinatura`);

  console.log("\n🎉 Seed de assinaturas concluído!");
}

main()
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
