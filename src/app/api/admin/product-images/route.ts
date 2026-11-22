import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSameOrigin } from "@/lib/server/origin-guard";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 3.2 * 1024 * 1024) {
    return NextResponse.json({ error: "Choose an image up to 3 MB after optimization." }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size < 1 || file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Choose a JPG, PNG or WebP image up to 3 MB." },
        { status: 400 },
      );
    }

    const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${crypto.randomUUID()}.${extension}`;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
    if (error) throw error;
    return NextResponse.json({ imagePath: path });
  } catch (error) {
    console.error("Product image upload failed.", error);
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 503 });
  }
}
