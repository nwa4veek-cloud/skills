import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm sm:p-9">
        <Link className="text-sm font-semibold text-[var(--leaf)] hover:underline" href="/">← Phone Match</Link>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Vendor access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to manage your catalogue.</h1>
        <p className="mt-3 leading-6 text-[var(--muted)]">Administrator accounts are created and assigned by the Supabase project owner.</p>
        <AdminLoginForm setupMissing={params.error === "setup"} />
      </section>
    </main>
  );
}
