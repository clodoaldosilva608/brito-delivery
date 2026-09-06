import { NextRequest, NextResponse } from "next/server";

// GET /api/cep?cep=XXXXX-XXX — consulta ViaCEP
export async function GET(req: NextRequest) {
  const cepRaw = req.nextUrl.searchParams.get("cep") || "";
  const cep = cepRaw.replace(/\D/g, "");

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      // Next.js 16: opt-out of caching para chamada externa dinâmica
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Falha ao consultar CEP" }, { status: 502 });
    }
    const data = await res.json();
    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao consultar ViaCEP" }, { status: 500 });
  }
}
