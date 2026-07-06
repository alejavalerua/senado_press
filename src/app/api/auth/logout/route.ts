import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/infrastructure/auth/session";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}