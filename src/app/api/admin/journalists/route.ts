import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { requireAdmin } from "@/infrastructure/auth/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    const journalists = await container.authRepo.findAllJournalists();
    return NextResponse.json({ journalists });
  } catch (error) {
    console.error("Admin journalists error:", error);
    return NextResponse.json({ error: "Error al cargar periodistas" }, { status: 500 });
  }
}