"use client";

import Link from "next/link";

export function AdminNavigation() {
  return (
    <header className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link className="font-bold" href="/admin">Phone Match <span className="font-normal text-[var(--muted)]">/ Vendor dashboard</span></Link>
        <nav aria-label="Administrator navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
          <Link className="text-[var(--leaf)] hover:underline" href="/admin">Overview</Link>
          <Link className="text-[var(--leaf)] hover:underline" href="/admin/products/new">Add product</Link>
          <Link className="text-[var(--leaf)] hover:underline" href="/admin/settings">Settings</Link>
          <form action="/api/auth/signout" method="post">
            <button className="rounded-full border border-[var(--line)] px-4 py-2 hover:border-[var(--leaf)]" type="submit">Sign out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
