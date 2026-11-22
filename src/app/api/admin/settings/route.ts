import { NextResponse } from "next/server";
import { isValidSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSameOrigin } from "@/lib/server/origin-guard";

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const settings = await request.json();
    if (!isValidSettings(settings)) {
      return NextResponse.json(
        { error: "Use an international WhatsApp number or leave it blank, seven valid budget ranges and flexibility values up to 100%." },
        { status: 400 },
      );
    }
    const supabase = createSupabaseAdminClient();
    const updates = [
      { key: "whatsapp_number", value: settings.whatsappNumber },
      { key: "budget_ranges", value: settings.budgetRanges },
      { key: "recommendation_config", value: settings.recommendation },
    ];
    const { error } = await supabase
      .from("app_settings")
      .upsert(updates, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Application settings could not be saved.", error);
    return NextResponse.json({ error: "Settings could not be saved. Please try again." }, { status: 503 });
  }
}
