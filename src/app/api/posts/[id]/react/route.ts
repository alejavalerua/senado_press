import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { getSession } from "@/infrastructure/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const type = body.type as "like" | "dislike";

    if (type !== "like" && type !== "dislike") {
      return NextResponse.json({ error: "Tipo de reacción inválido" }, { status: 400 });
    }

    const reaction = await container.toggleReactionUseCase.execute(id, session.userId, type);
    const post = await container.postRepo.findById(id);

    return NextResponse.json({ reaction, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reaccionar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}