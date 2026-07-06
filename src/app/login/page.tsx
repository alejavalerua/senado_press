export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/auth/session";
import { LoginForm } from "@/presentation/components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/feed");
  }

  return <LoginForm />;
}