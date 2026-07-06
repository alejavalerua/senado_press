export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/auth/session";
import { container } from "@/infrastructure/di/container";
import { AdminPanel } from "@/presentation/components/AdminPanel";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/feed");

  let state;
  try {
    state = await container.senateStateRepo.get();
  } catch {
    redirect("/login");
  }

  return <AdminPanel user={session} initialState={state} />;
}