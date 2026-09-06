import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const SignupSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, email, phone, password } = parsed.data;

    const existing = await db.profile.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    const hash = await hashPassword(password);
    const profile = await db.profile.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hash,
        roles: { create: { role: "CUSTOMER" } },
      },
      include: { roles: true },
    });

    await setSessionCookie({
      sub: profile.id,
      email: profile.email,
      name: profile.name,
      roles: profile.roles.map((r) => r.role),
    });

    return NextResponse.json(
      { profile: { id: profile.id, name: profile.name, email: profile.email, roles: profile.roles.map((r) => r.role) } },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
