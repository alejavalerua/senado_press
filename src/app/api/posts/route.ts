import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { getSession } from "@/infrastructure/auth/session";
import { PostTag } from "@/domain/entities/Post";

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get("filter") ?? "todo";
    const posts = await container.postRepo.findApproved({ filterType: filter });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json({ error: "Error al cargar despachos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (session.role !== "journalist") {
      return NextResponse.json({ error: "Solo periodistas pueden publicar" }, { status: 403 });
    }

    const body = await req.json();
    let targetJournalistId = body.targetJournalistId ?? null;
    let tag = body.tag as PostTag;

    if (body.parentPostId) {
      const parent = await container.postRepo.findById(body.parentPostId);
      if (!parent) {
        return NextResponse.json({ error: "El mensaje al que respondes no existe" }, { status: 404 });
      }
      if (!targetJournalistId) {
        targetJournalistId = parent.author.id;
      }
      if (!tag) tag = parent.tag;
    }

    const result = await container.createPostUseCase.execute({
      authorId: session.userId,
      content: body.content,
      tag: tag ?? "observacion",
      imageUrl: body.imageUrl ?? null,
      targetSenatorId: body.targetSenatorId ?? null,
      targetJournalistId,
      parentPostId: body.parentPostId ?? null,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al publicar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}