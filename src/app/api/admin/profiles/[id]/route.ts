import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// PATCH /api/admin/profiles/[id] — atualizar usuário (nome, phone, roles, resetar senha)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, phone, roles, newPassword, ban } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone || null;

    // Reset de senha
    if (newPassword) {
      update.password = await hashPassword(newPassword);
    }

    const profile = await db.profile.update({
      where: { id },
      data: update,
    });

    // Atualizar roles
    if (Array.isArray(roles)) {
      await db.userRole.deleteMany({ where: { profileId: id } });
      if (roles.length > 0) {
        await db.userRole.createMany({
          data: roles.map((r: string) => ({ profileId: id, role: r })),
        });
      }
    }

    return NextResponse.json({ profile });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    console.error("Admin update profile error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/admin/profiles/[id] — excluir usuário
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    if (id === session.sub) {
      return NextResponse.json({ error: "Você não pode excluir a própria conta" }, { status: 400 });
    }

    await db.profile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
