import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const profile = await db.profile.findUnique({
      where: { email },
      include: { roles: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, profile.password);
    if (!valid) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    await setSessionCookie({
      sub: profile.id,
      email: profile.email,
      name: profile.name,
      roles: profile.roles.map((r) => r.role),
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        roles: profile.roles.map((r) => r.role),
      },
    });
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
