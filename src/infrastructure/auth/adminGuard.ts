import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./session";

export async function requireAdmin(): Promise<
  { session: SessionPayload } | { error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  if (session.role !== "admin") {
    return { error: NextResponse.json({ error: "Acceso solo para administradores" }, { status: 403 }) };
  }
  return { session };
}