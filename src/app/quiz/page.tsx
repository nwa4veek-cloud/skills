import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Quiz } from "@/components/quiz";

export const metadata: Metadata = {
  title: "Find your phone match",
  description: "Answer five questions about your budget and priorities to explore available smartphone matches.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-5 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-10">
        <div className="mx-auto mb-7 max-w-3xl">
          <p className="text-sm text-[var(--muted)]"><Link className="font-semibold text-[var(--leaf)] underline-offset-4 hover:underline" href="/">Home</Link> / Find your phone</p>
          <p className="mt-3 text-sm text-[var(--muted)]">No account needed. Your answers help compare the vendor’s available phones.</p>
        </div>
        <Quiz />
      </main>
      <SiteFooter />
    </>
  );
}
