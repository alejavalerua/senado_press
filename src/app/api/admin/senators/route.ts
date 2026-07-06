import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { requireAdmin } from "@/infrastructure/auth/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const senators = await container.senatorRepo.findAll(true);
    return NextResponse.json({ senators });
  } catch (error) {
    console.error("Admin senators error:", error);
    return NextResponse.json({ error: "Error al cargar senadores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const body = await req.json();
    const senator = await container.manageSenatorUseCase.create({
      fullName: body.fullName,
      party: body.party,
      caucus: body.caucus,
      photoUrl: body.photoUrl,
    });
    return NextResponse.json({ senator }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear senador";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}