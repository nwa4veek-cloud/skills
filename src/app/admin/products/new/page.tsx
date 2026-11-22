import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export default async function NewProductPage() {
  const { authorized } = await requireAdmin();
  if (!authorized) redirect("/admin/login");
  return (
    <>
      <AdminNavigation />
      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <ProductForm />
      </main>
    </>
  );
}
