import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { getSession } from "@/infrastructure/auth/session";

export async function GET() {
  try {
    const state = await container.senateStateRepo.get();
    return NextResponse.json({ state });
  } catch (error) {
    console.error("Senate state error:", error);
    return NextResponse.json({ error: "Error al cargar estado del senado" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const state = await container.updateSenateStateUseCase.execute({
      ...body,
      updatedBy: session.userId,
    });
    return NextResponse.json({ state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}