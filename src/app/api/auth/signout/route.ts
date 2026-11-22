import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/server/origin-guard";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Could not end the sign-in session.", error);
  }
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}
