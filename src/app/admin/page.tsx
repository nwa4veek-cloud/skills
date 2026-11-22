import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { AdminProductListItem } from "@/components/admin-product-list-item";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import type { Product } from "@/lib/types";

type StatCardProps = { label: string; value: string; detail: string };

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
    </article>
  );
}

export default async function AdminPage() {
  const { authorized } = await requireAdmin();
  if (!authorized) redirect("/admin/login");

  let products: Product[] = [];
  let stats = { activeProducts: "—", quizSubmissions: "—", whatsappClicks: "—" };
  let loadError = "";
  try {
    const supabase = createSupabaseAdminClient();
    const [productResult, productCount, submissions, whatsapp] = await Promise.allSettled([
      supabase.from("products").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true).eq("available", true),
      supabase.from("quiz_submissions").select("id", { count: "exact", head: true }),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "whatsapp_clicked"),
    ]);

    if (productResult.status === "fulfilled" && !productResult.value.error) {
      products = (productResult.value.data ?? []) as Product[];
    } else {
      loadError = "Product inventory could not be loaded.";
    }
    stats = {
      activeProducts: productCount.status === "fulfilled" && !productCount.value.error ? String(productCount.value.count ?? 0) : "—",
      quizSubmissions: submissions.status === "fulfilled" && !submissions.value.error ? String(submissions.value.count ?? 0) : "—",
      whatsappClicks: whatsapp.status === "fulfilled" && !whatsapp.value.error ? String(whatsapp.value.count ?? 0) : "—",
    };
  } catch (error) {
    console.error("Administrator dashboard data could not be loaded.", error);
    loadError = "Dashboard data is not available. Check the Supabase server settings and migration.";
  }

  return (
    <>
      <AdminNavigation />
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Administrator</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Product dashboard</h1>
            <p className="mt-2 text-[var(--muted)]">Manage catalogue details and see a few Phase 1 interaction counts.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--leaf)] px-5 font-semibold text-white hover:bg-[var(--leaf-dark)]" href="/admin/products/new">Add a phone <span aria-hidden="true" className="ml-2">+</span></Link>
        </div>

        <section aria-label="Basic interaction statistics" className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard detail="Active and available in the catalogue" label="Recommendable products" value={stats.activeProducts} />
          <StatCard detail="Completed recommendation quizzes" label="Quiz submissions" value={stats.quizSubmissions} />
          <StatCard detail="Clicks on WhatsApp enquiry links" label="WhatsApp enquiries" value={stats.whatsappClicks} />
        </section>
        <p className="mt-3 text-xs text-[var(--muted)]">Counts are all-time totals. A click does not mean a WhatsApp message was sent or delivered.</p>

        <section className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Product inventory</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Only active, available and fully configured products can be recommended.</p>
            </div>
            <span className="hidden rounded-full bg-[#edf6df] px-3 py-1 text-sm font-semibold text-[var(--leaf)] sm:inline">{products.length} shown</span>
          </div>
          {loadError ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{loadError}</p> : null}
          {!loadError && products.length === 0 ? (
            <div className="mt-7 rounded-2xl bg-[var(--paper)] p-6 text-center">
              <h3 className="font-semibold">Your catalogue is empty.</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Add and configure the first phone to make it eligible for customer matches.</p>
              <Link className="mt-4 inline-flex rounded-full bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]" href="/admin/products/new">Add your first phone</Link>
            </div>
          ) : null}
          {products.length > 0 ? <ul className="mt-5"><>{products.map((product) => <AdminProductListItem key={product.id} product={product} />)}</></ul> : null}
          {products.length === 100 ? <p className="mt-4 text-sm text-[var(--muted)]">Showing the most recently updated 100 products.</p> : null}
        </section>
      </main>
    </>
  );
}
