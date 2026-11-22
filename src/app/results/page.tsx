import type { Metadata } from "next";
import { Results } from "@/components/results";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Your phone matches",
  description: "Your smartphone shortlist, selected for your budget and priorities.",
  robots: { index: false, follow: false },
};

export default function ResultsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
        <Results />
      </main>
      <SiteFooter />
    </>
  );
}
