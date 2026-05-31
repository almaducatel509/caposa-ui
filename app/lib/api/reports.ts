import { NextResponse } from "next/server";

// ============================================================
// app/api/reports/route.ts
// ------------------------------------------------------------
// Route API temporaire — simule le backend Django.
// 🔌 À supprimer quand le vrai backend est branché.
//
// GET  /api/reports → retourne une liste vide
// POST /api/reports → simule la création d'un rapport
// ============================================================

// GET — liste des rapports (vide pour l'instant)
export async function GET() {
  return NextResponse.json([]);
}

// POST — création d'un rapport
export async function POST(request: Request) {
  const body = await request.json();

  // Simule un délai réseau
  await new Promise(r => setTimeout(r, 500));

  // Retourne un rapport fictif avec id + référence générés
  const rapport = {
    id:        crypto.randomUUID(),
    reference: `RPT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...body,
    genere_le: new Date().toISOString(),
  };

  return NextResponse.json(rapport, { status: 201 });
}