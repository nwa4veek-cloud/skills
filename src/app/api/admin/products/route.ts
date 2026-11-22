import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateProductInput } from "@/lib/server/product-validation";
import { isSameOrigin } from "@/lib/server/origin-guard";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const product = validateProductInput(await request.json());
    if (!product) return NextResponse.json({ error: "Check the product details and matching scores." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("products").insert(product).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error("Product could not be created.", error);
    return NextResponse.json({ error: "Product could not be saved. Check your connection and try again." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const body = await request.json();
    const id = typeof body?.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
    const product = validateProductInput(body?.product);
    if (!id || !product) return NextResponse.json({ error: "Check the product details and matching scores." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("products")
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Product could not be updated.", error);
    return NextResponse.json({ error: "Product could not be updated. Check your connection and try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const body = await request.json();
    const id = typeof body?.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
    if (!id) return NextResponse.json({ error: "Choose a valid product." }, { status: 400 });
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Product could not be deleted.", error);
    return NextResponse.json(
      { error: "Product could not be deleted. Products already used in recommendations must be deactivated instead." },
      { status: 409 },
    );
  }
}
