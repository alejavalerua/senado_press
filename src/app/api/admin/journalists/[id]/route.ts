import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { requireAdmin } from "@/infrastructure/auth/adminGuard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const body = await req.json();

    const journalist = await container.updateJournalistUseCase.execute(id, {
      displayName: body.displayName,
      email: body.email,
      mediaOutlet: body.mediaOutlet,
      isActive: body.status === "libre" ? true : body.status === "bloqueado" ? false : body.isActive,
    });

    return NextResponse.json({ journalist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}