import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || user.app_metadata?.role !== "admin") {
      return { authorized: false as const };
    }
    return { authorized: true as const, supabase, user };
  } catch {
    return { authorized: false as const };
  }
}
