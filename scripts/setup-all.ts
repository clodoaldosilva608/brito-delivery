// scripts/setup-all.ts
// Roda todos os seeds na ordem correta: seed → subscriptions → admin
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("🚀 Setup completo do Brito — rodando todos os seeds...\n");

  // 1. Seed principal (lojas, cardápios, pedidos, usuários demo)
  console.log("1️⃣  Seed principal...");
  await import("./seed");

  // 2. Seed de assinaturas (planos + status das lojas)
  console.log("\n2️⃣  Seed de assinaturas...");
  await import("./seed-subscriptions");

  // 3. Criar admin master
  console.log("\n3️⃣  Criando admin master...");
  const email = "clodoaldo608@gmail.com";
  const password = "88677488";
  const name = "Clodoaldo (Admin Master)";

  const existing = await db.profile.findUnique({ where: { email }, include: { roles: true } });
  if (existing) {
    // Atualizar senha e garantir roles
    const hash = await hashPassword(password);
    await db.profile.update({ where: { id: existing.id }, data: { password: hash, name } });
    await db.userRole.upsert({
      where: { profileId_role: { profileId: existing.id, role: "OWNER" } },
      update: {},
      create: { profileId: existing.id, role: "OWNER" },
    });
    await db.userRole.upsert({
      where: { profileId_role: { profileId: existing.id, role: "ADMIN" } },
      update: {},
      create: { profileId: existing.id, role: "ADMIN" },
    });
    console.log("✅ Admin master atualizado:", email);
  } else {
    const hash = await hashPassword(password);
    const profile = await db.profile.create({
      data: {
        name, email, password: hash,
        roles: { create: [{ role: "OWNER" }, { role: "ADMIN" }, { role: "CUSTOMER" }] },
      },
      include: { roles: true },
    });
    console.log("✅ Admin master criado:", email);
    console.log("   Roles:", profile.roles.map(r => r.role).join(", "));
  }

  console.log("\n🎉 Setup completo!");
  console.log("\n📝 Credenciais de acesso:");
  console.log("   Admin Master: clodoaldo608@gmail.com / 88677488");
  console.log("   Dono demo: marco@brito.demo / senha123");
  console.log("   Cliente demo: cliente@brito.demo / senha123");

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
