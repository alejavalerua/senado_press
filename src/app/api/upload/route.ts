import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/infrastructure/auth/session";
import { createServiceClient } from "@/infrastructure/supabase/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Solo se permiten imágenes (JPG, PNG, WebP, GIF)" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 5 MB" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${session.userId}/${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from("post-images").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json({ error: "Error al subir imagen: " + error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }
}