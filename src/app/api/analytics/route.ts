import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestKey, isRateLimited } from "@/lib/server/rate-limit";
import { isSameOrigin } from "@/lib/server/origin-guard";

const ALLOWED_EVENTS = new Set(["quiz_started", "whatsapp_clicked"]);

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }
  if (isRateLimited(getRequestKey(request), 40)) {
    return NextResponse.json({ error: "Please wait a moment before trying again." }, { status: 429 });
  }

  try {
    const body = await request.json();
    if (!body || !ALLOWED_EVENTS.has(body.eventName)) {
      return NextResponse.json({ error: "Unsupported event." }, { status: 400 });
    }
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const productId = typeof body.productId === "string" && uuidPattern.test(body.productId) ? body.productId : null;
    const submissionId = typeof body.submissionId === "string" && uuidPattern.test(body.submissionId) ? body.submissionId : null;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("analytics_events").insert({
      event_name: body.eventName,
      product_id: productId,
      submission_id: submissionId,
    });
    if (error) throw error;
    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("Analytics event could not be recorded.", error);
    return NextResponse.json({ error: "Analytics are temporarily unavailable." }, { status: 503 });
  }
}
