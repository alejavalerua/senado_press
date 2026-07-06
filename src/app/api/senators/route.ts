import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";

export async function GET() {
  try {
    const senators = await container.senatorRepo.findAll();
    return NextResponse.json({ senators });
  } catch (error) {
    console.error("Senators error:", error);
    return NextResponse.json({ error: "Error al cargar senadores" }, { status: 500 });
  }
}