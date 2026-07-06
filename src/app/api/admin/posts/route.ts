import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { requireAdmin } from "@/infrastructure/auth/adminGuard";

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