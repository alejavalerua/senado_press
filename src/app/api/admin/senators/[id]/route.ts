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
    const senator = await container.manageSenatorUseCase.update(id, body);
    return NextResponse.json({ senator });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    await container.manageSenatorUseCase.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}