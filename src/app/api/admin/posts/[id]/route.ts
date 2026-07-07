import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { requireAdmin } from "@/infrastructure/auth/adminGuard";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const post = await container.postRepo.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Despacho no encontrado" }, { status: 404 });
    }

    await container.postRepo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete post error:", error);
    return NextResponse.json({ error: "Error al eliminar despacho" }, { status: 500 });
  }
}