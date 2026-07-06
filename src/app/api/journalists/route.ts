import { NextResponse } from "next/server";
import { createServiceClient } from "@/infrastructure/supabase/client";
import { mapProfile } from "@/infrastructure/supabase/mappers";
import { getSession } from "@/infrastructure/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, media_outlet, avatar_url, role, is_active, created_at")
      .eq("role", "journalist")
      .eq("is_active", true)
      .order("display_name");

    if (error) throw new Error(error.message);
    return NextResponse.json({ journalists: (data ?? []).map(mapProfile) });
  } catch (error) {
    console.error("Journalists error:", error);
    return NextResponse.json({ error: "Error al cargar periodistas" }, { status: 500 });
  }
}