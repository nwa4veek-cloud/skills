import Link from "next/link";
import { memo } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const steps = [
  {
    number: "01",
    title: "Set your budget",
    description: "Choose a price range or enter what you want to spend.",
  },
  {
    number: "02",
    title: "Choose your top two",
    description: "Tell us what matters most in the phone you will use every day.",
  },
  {
    number: "03",
    title: "Compare your matches",
    description: "See available phones and why each one fits your answers.",
  },
];

const HowItWorksStep = memo(function HowItWorksStep({ number, title, description }: (typeof steps)[number]) {
  return (
    <li className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-7">
      <span className="grid size-12 place-items-center rounded-2xl bg-[var(--lime)] text-sm font-bold text-[var(--leaf-dark)]">{number}</span>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-[var(--muted)]">{description}</p>
    </li>
  );
});

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="overflow-hidden px-5 pb-20 pt-9 sm:px-8 sm:pb-28 sm:pt-14">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--leaf)]">
                <span aria-hidden="true" className="size-2 rounded-full bg-[var(--leaf)]" />
                A clearer way to choose
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Stop guessing. Find the phone that <span className="text-[var(--leaf)]">fits you.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
                Not sure whether to buy a London-used flagship or a brand-new budget phone? Answer five simple questions and see which available phones match your budget and priorities.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link className="inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--leaf)] px-7 text-base font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[var(--leaf-dark)]" href="/quiz">
                  Find my phone <span aria-hidden="true" className="ml-3 text-xl">→</span>
                </Link>
                <span className="text-sm text-[var(--muted)]">Five questions. No account needed.</span>
              </div>
              <p className="mt-10 text-sm font-medium text-[var(--muted)]">Powered by <span className="text-[var(--ink)]">MATT6:33 GADGET HUB.</span></p>
            </div>

            <div aria-label="Illustration of a phone recommendation card" className="relative mx-auto w-full max-w-lg">
              <div aria-hidden="true" className="absolute -right-7 -top-8 size-36 rounded-full bg-[var(--lime)] opacity-70 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white bg-[#e8eee6] p-5 shadow-2xl shadow-emerald-950/10 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Your shortlist</p>
                    <p className="mt-1 text-xl font-semibold">Made around you</p>
                  </div>
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-white text-xl text-[var(--leaf)]">✓</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                    <div aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-xl bg-[#f0f3ed] text-2xl">📱</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">A better-informed choice</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">Recommendations based on your answers</p>
                    </div>
                    <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[var(--leaf)]">Match</span>
                  </div>
                  <div className="rounded-2xl bg-[var(--leaf)] p-5 text-white">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Your needs come first</p>
                      <span aria-hidden="true" className="text-xl">✳</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/75">Clear trade-offs, current availability and a direct way to ask the vendor.</p>
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-[var(--muted)]">Illustration only. Your actual matches depend on available inventory.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 sm:px-8 sm:py-20" id="how-it-works">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A few thoughtful answers. A clearer shortlist.</h2>
            </div>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step) => <HowItWorksStep key={step.number} {...step} />)}
            </ol>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] bg-[#e8eee6] p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Straightforward advice</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Know what a match means—and what to check.</h2>
            </div>
            <div>
              <p className="leading-7 text-[var(--muted)]">Your shortlist comes from the vendor’s current catalogue, your selected priorities and your budget. A match is a guide, not an independent product rating or a guarantee of device condition.</p>
              <p className="mt-4 leading-7 text-[var(--muted)]">Considering a London-used phone? You’ll also get a practical inspection checklist and can ask the vendor to confirm availability, condition and final price.</p>
              <Link className="mt-6 inline-flex rounded-full border border-[var(--leaf)] px-5 py-3 text-sm font-semibold text-[var(--leaf)] hover:bg-white" href="/quiz">See what fits me <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-[var(--leaf)] p-8 text-white sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Ready to narrow it down?</h2>
              <p className="mt-2 text-white/75">Start with what matters most to you.</p>
            </div>
            <Link className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-[var(--leaf)] hover:bg-[var(--lime)]" href="/quiz">Find my phone <span aria-hidden="true" className="ml-2">→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
