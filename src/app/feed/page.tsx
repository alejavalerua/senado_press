export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/auth/session";
import { container } from "@/infrastructure/di/container";
import { FeedClient } from "@/presentation/components/FeedClient";
import { createServiceClient } from "@/infrastructure/supabase/client";
import { mapProfile } from "@/infrastructure/supabase/mappers";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  let state, senators, journalists;

  try {
    [state, senators] = await Promise.all([
      container.senateStateRepo.get(),
      container.senatorRepo.findAll(),
    ]);

    const supabase = createServiceClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "journalist")
      .eq("is_active", true);
    journalists = (data ?? []).map(mapProfile);
  } catch {
    redirect("/login");
  }

  return (
    <FeedClient
      user={session}
      initialState={state}
      senators={senators}
      journalists={journalists}
    />
  );
}