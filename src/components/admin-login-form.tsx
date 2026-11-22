"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function AdminLoginForm({ setupMissing = false }: { setupMissing?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    setupMissing ? "Add the Supabase project settings to .env.local before signing in." : "",
  );

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      setError("Administrator sign-in is not configured. Set up Supabase using the project guide.");
      setBusy(false);
      return;
    }

    const supabase = createBrowserClient(url, anonKey);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError("We could not sign you in. Check your email and password, then try again.");
      setBusy(false);
      return;
    }
    if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }, [email, password, router]);

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Email address</span>
        <input autoComplete="username" className="min-h-12 w-full rounded-xl border border-[var(--line)] px-4 focus:border-[var(--leaf)]" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Password</span>
        <input autoComplete="current-password" className="min-h-12 w-full rounded-xl border border-[var(--line)] px-4 focus:border-[var(--leaf)]" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p> : null}
      <button className="min-h-12 w-full rounded-full bg-[var(--leaf)] px-5 font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-70" disabled={busy} type="submit">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
