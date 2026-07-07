import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { requireAdmin } from "@/infrastructure/auth/adminGuard";
import { PostTag } from "@/domain/entities/Post";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const posts = await container.postRepo.findAllForAdmin();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Admin posts error:", error);
    return NextResponse.json({ error: "Error al cargar despachos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const body = await req.json();
    const trimmed = (body.content as string)?.trim() ?? "";

    if (trimmed.length < 10) {
      return NextResponse.json(
        { error: "El despacho debe tener al menos 10 caracteres" },
        { status: 400 }
      );
    }
    if (trimmed.length > 2000) {
      return NextResponse.json(
        { error: "El despacho no puede superar 2000 caracteres" },
        { status: 400 }
      );
    }

    const tag = (body.tag as PostTag) ?? "observacion";
    const validTags: PostTag[] = ["observacion", "debate", "pregunta", "critica", "sesion"];
    if (!validTags.includes(tag)) {
      return NextResponse.json({ error: "Etiqueta inválida" }, { status: 400 });
    }

    const post = await container.postRepo.create({
      authorId: guard.session.userId,
      content: trimmed,
      tag,
      imageUrl: body.imageUrl ?? null,
      targetSenatorId: body.targetSenatorId ?? null,
      targetJournalistId: body.targetJournalistId ?? null,
      parentPostId: null,
      status: "approved",
      moderationNote: null,
    });

    return NextResponse.json(
      { post, message: "Despacho oficial publicado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al publicar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}