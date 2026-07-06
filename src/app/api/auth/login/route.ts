import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { createSession, setSessionCookie } from "@/infrastructure/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, username } = body;
    const loginId = identifier ?? username;

    if (!loginId || !password) {
      return NextResponse.json({ error: "Correo/usuario y contraseña requeridos" }, { status: 400 });
    }

    const result = await container.loginUseCase.execute({ identifier: loginId, password });

    if (!result.success || !result.profile) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await createSession(result.profile);
    await setSessionCookie(token);

    return NextResponse.json({
      profile: result.profile,
      redirectTo: result.profile.role === "admin" ? "/admin" : "/feed",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}