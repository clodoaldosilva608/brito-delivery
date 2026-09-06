import { NextRequest, NextResponse } from "next/server";

// GET /api/geocode?q=address — geocoding via Nominatim (OpenStreetMap)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ error: "Query muito curta" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Brito/1.0 (delivery app)",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Falha ao consultar Nominatim" }, { status: 502 });
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });
    }
    const r = data[0];
    return NextResponse.json({
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      displayName: r.display_name,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao geocodificar" }, { status: 500 });
  }
}
