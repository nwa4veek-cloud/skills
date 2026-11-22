import { notFound, redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { ProductForm } from "@/components/product-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { authorized } = await requireAdmin();
  if (!authorized) redirect("/admin/login");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let product: Product | null = null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    product = data as Product | null;
  } catch (error) {
    console.error("Product editing data could not be loaded.", error);
    return (
      <>
        <AdminNavigation />
        <main className="mx-auto max-w-3xl px-5 py-12">
          <section className="rounded-3xl bg-white p-8">
            <h1 className="text-2xl font-semibold">Product could not be loaded</h1>
            <p className="mt-3 leading-7 text-[var(--muted)]">Check the Supabase server configuration, database migration and product ID, then try again.</p>
          </section>
        </main>
      </>
    );
  }
  if (!product) notFound();

  return (
    <>
      <AdminNavigation />
      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <ProductForm product={product} />
      </main>
    </>
  );
}
