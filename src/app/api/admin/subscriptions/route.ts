import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.roles.includes("ADMIN")) throw new Error("FORBIDDEN");
  return session;
}

// GET /api/admin/subscriptions — listar planos
export async function GET() {
  try {
    await requireAdmin();
    const plans = await db.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
      include: {
        _count: { select: { stores: true } },
      },
    });
    return NextResponse.json({ plans });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

const CreatePlanSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Preço inválido"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  features: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  maxStores: z.number().int().min(1).default(1),
  maxMenuItems: z.number().int().min(1).default(100),
});

// POST /api/admin/subscriptions — criar plano
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }
    const plan = await db.subscriptionPlan.create({ data: parsed.data });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
