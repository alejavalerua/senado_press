import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { getSession } from "@/infrastructure/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const posts = await container.postRepo.findPending();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Pending posts error:", error);
    return NextResponse.json({ error: "Error al cargar moderación" }, { status: 500 });
  }
}