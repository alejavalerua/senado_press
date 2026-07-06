import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { getSession } from "@/infrastructure/auth/session";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, note } = body as { action: "approve" | "reject" | "block"; note?: string };

    let post;
    if (action === "approve") {
      post = await container.moderatePostUseCase.approve(id, session.userId);
    } else if (action === "reject") {
      post = await container.moderatePostUseCase.reject(id, session.userId, note ?? "Rechazado por moderación");
    } else if (action === "block") {
      post = await container.moderatePostUseCase.block(id, session.userId, note ?? "Contenido inadecuado");
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error en moderación";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}