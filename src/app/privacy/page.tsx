import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Phone Match handles quiz answers and basic interaction statistics.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Privacy notice</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your answers are used to find a phone match.</h1>
        <div className="mt-8 space-y-5 leading-7 text-[var(--muted)]">
          <p>Phone Match stores the budget range, selected priorities, intended usage, condition preference, flexibility choice and resulting recommendations so the vendor can understand basic service interactions.</p>
          <p>The quiz does not ask for your name, email address, phone number or account. Product enquiries open WhatsApp with a draft message; you choose whether to send it. Phone Match cannot confirm that a WhatsApp message was delivered.</p>
          <p>Only authorised administrators can access stored quiz submissions and interaction records. The Phase 1 app does not yet include automated deletion or a configured retention schedule. Before public launch, the business should set a retention period and add a contact method for privacy requests.</p>
          <p>Product availability and prices may change. Ask the vendor to confirm current availability, condition, warranty and final price before you buy.</p>
        </div>
        <Link className="mt-8 inline-flex rounded-full bg-[var(--leaf)] px-5 py-3 font-semibold text-white hover:bg-[var(--leaf-dark)]" href="/quiz">Continue to the quiz</Link>
      </main>
      <SiteFooter />
    </>
  );
}
