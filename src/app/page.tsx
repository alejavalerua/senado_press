export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/auth/session";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/feed");
  }
  redirect("/login");
}