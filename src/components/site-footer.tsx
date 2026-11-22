import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Phone Match — Less Confusion. Better Choices.</p>
        <div className="flex items-center gap-5">
          <Link className="underline-offset-4 hover:underline" href="/privacy">Privacy</Link>
          <Link className="underline-offset-4 hover:underline" href="/admin/login">Vendor sign in</Link>
          <span>Powered by MATT6:33 GADGET HUB.</span>
        </div>
      </div>
    </footer>
  );
}
