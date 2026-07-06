import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { createSession, setSessionCookie } from "@/infrastructure/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await container.registerUseCase.execute({
      displayName: body.displayName,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
      mediaOutlet: body.mediaOutlet,
    });

    if (!result.success || !result.profile) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const token = await createSession(result.profile);
    await setSessionCookie(token);

    return NextResponse.json({
      profile: result.profile,
      redirectTo: "/feed",
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    const message = error instanceof Error ? error.message : "Error al registrarse";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}