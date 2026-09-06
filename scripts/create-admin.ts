// scripts/create-admin.ts
// Create admin master account
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  const email = "clodoaldo608@gmail.com";
  const password = "88677488";
  const name = "Clodoaldo (Admin Master)";

  console.log("🔐 Criando conta admin master...");

  // Verificar se já existe
  const existing = await db.profile.findUnique({ where: { email }, include: { roles: true } });
  if (existing) {
    // Atualizar senha e garantir roles
    const hash = await hashPassword(password);
    await db.profile.update({
      where: { id: existing.id },
      data: { password: hash, name },
    });
    // Garantir role OWNER
    await db.userRole.upsert({
      where: { profileId_role: { profileId: existing.id, role: "OWNER" } },
      update: {},
      create: { profileId: existing.id, role: "OWNER" },
    });
    // Garantir role ADMIN
    await db.userRole.upsert({
      where: { profileId_role: { profileId: existing.id, role: "ADMIN" } },
      update: {},
      create: { profileId: existing.id, role: "ADMIN" },
    });
    console.log("✅ Conta admin master atualizada:", email);
  } else {
    const hash = await hashPassword(password);
    const profile = await db.profile.create({
      data: {
        name,
        email,
        password: hash,
        roles: {
          create: [
            { role: "OWNER" },
            { role: "ADMIN" },
            { role: "CUSTOMER" },
          ],
        },
      },
      include: { roles: true },
    });
    console.log("✅ Conta admin master criada:", email);
    console.log("   Roles:", profile.roles.map(r => r.role).join(", "));
  }

  console.log("\n🎉 Admin master pronto!");
  console.log("Login: clodoaldo608@gmail.com");
  console.log("Senha: 88677488");
}

main()
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
