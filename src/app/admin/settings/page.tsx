import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { SettingsForm } from "@/components/settings-form";
import { getAppSettings } from "@/lib/server/settings";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export default async function AdminSettingsPage() {
  const { authorized } = await requireAdmin();
  if (!authorized) redirect("/admin/login");
  const settings = await getAppSettings();
  return (
    <>
      <AdminNavigation />
      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <SettingsForm initialSettings={settings} />
      </main>
    </>
  );
}
