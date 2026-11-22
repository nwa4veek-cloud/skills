import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link aria-label="Phone Match home" className="flex items-center gap-3" href="/">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-2xl bg-[var(--leaf)] text-lg font-bold text-white">
          PM
        </span>
        <span className="text-lg font-bold tracking-tight">phone match</span>
      </Link>
      <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
        <Link className="hidden text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] sm:inline" href="/#how-it-works">
          How it works
        </Link>
        <Link className="rounded-full bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]" href="/quiz">
          Find my phone
        </Link>
      </nav>
    </header>
  );
}
