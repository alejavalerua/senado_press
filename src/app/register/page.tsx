export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/auth/session";
import { RegisterForm } from "@/presentation/components/RegisterForm";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/feed");
  }

  return <RegisterForm />;
}