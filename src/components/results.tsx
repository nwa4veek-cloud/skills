"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductMatchCard } from "@/components/product-match-card";
import {
  CONDITIONS,
  PRIORITIES,
  PRIORITY_LABELS,
  USAGES,
  USAGE_LABELS,
  type PublicRecommendation,
  type QuizAnswers,
} from "@/lib/types";

type QuizResult = {
  submissionId: string;
  answers: QuizAnswers;
  customBudget: boolean;
  recommendations: PublicRecommendation[];
  whatsappNumber: string;
};

function isQuizResult(value: unknown): value is QuizResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<QuizResult>;
  const answers = result.answers as Partial<QuizAnswers> | undefined;
  return (
    typeof result.submissionId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.submissionId) &&
    !!answers &&
    typeof result.customBudget === "boolean" &&
    Number.isSafeInteger(answers.budget) &&
    Number(answers.budget) > 0 &&
    typeof answers.budgetLabel === "string" &&
    Array.isArray(answers.priorities) &&
    answers.priorities.length === 2 &&
    answers.priorities[0] !== answers.priorities[1] &&
    answers.priorities.every((priority) => PRIORITIES.includes(priority)) &&
    typeof answers.usage === "string" &&
    USAGES.includes(answers.usage) &&
    typeof answers.condition === "string" &&
    ["NEW_ONLY", "LONDON_USED_ONLY", "BOTH"].includes(answers.condition) &&
    typeof answers.flexibility === "string" &&
    ["STRICT", "SLIGHT", "FLEXIBLE"].includes(answers.flexibility) &&
    Array.isArray(result.recommendations) &&
    result.recommendations.length <= 3 &&
    result.recommendations.every((item) => {
      if (!item || typeof item !== "object") return false;
      const recommendation = item as PublicRecommendation;
      return (
        Number.isInteger(recommendation.score) &&
        recommendation.score >= 55 &&
        recommendation.score <= 100 &&
        ["Excellent Match", "Good Match", "Fair Match", "Weak Match"].includes(recommendation.classification) &&
        typeof recommendation.explanation === "string" &&
        Array.isArray(recommendation.advantages) &&
        recommendation.advantages.every((text) => typeof text === "string") &&
        Array.isArray(recommendation.tradeOffs) &&
        recommendation.tradeOffs.every((text) => typeof text === "string") &&
        (recommendation.checklist === null ||
          (Array.isArray(recommendation.checklist) &&
            recommendation.checklist.every((text) => typeof text === "string"))) &&
        !!recommendation.product &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recommendation.product.id) &&
        typeof recommendation.product.name === "string" &&
        typeof recommendation.product.brand === "string" &&
        typeof recommendation.product.model === "string" &&
        Number.isSafeInteger(recommendation.product.price) &&
        recommendation.product.price > 0 &&
        CONDITIONS.includes(recommendation.product.condition) &&
        typeof recommendation.product.description === "string" &&
        [
          recommendation.product.ram,
          recommendation.product.storage,
          recommendation.product.processor,
          recommendation.product.display,
          recommendation.product.camera,
          recommendation.product.battery,
          recommendation.product.physical_condition,
          recommendation.product.warranty,
        ].every((field) => field === null || typeof field === "string") &&
        (recommendation.product.battery_health === null ||
          Number.isInteger(recommendation.product.battery_health)) &&
        (recommendation.product.image_path === null ||
          (typeof recommendation.product.image_path === "string" &&
            !recommendation.product.image_path.startsWith("/") &&
            !recommendation.product.image_path.includes("..")))
      );
    }) &&
    typeof result.whatsappNumber === "string" &&
    (result.whatsappNumber === "" || /^\d{8,15}$/.test(result.whatsappNumber))
  );
}

function trackWhatsAppClick(productId: string, submissionId: string) {
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName: "whatsapp_clicked", productId, submissionId }),
  }).catch(() => undefined);
}

export function Results() {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const prioritySummary = useMemo(
    () => result?.answers.priorities.map((priority) => PRIORITY_LABELS[priority]).join(" and ") ?? "",
    [result?.answers.priorities],
  );
  const restartQuiz = useCallback(() => {
    try {
      window.sessionStorage.removeItem("phone-match-result");
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    try {
      const storedResult = window.sessionStorage.getItem("phone-match-result");
      if (storedResult) {
        const parsed: unknown = JSON.parse(storedResult);
        if (isQuizResult(parsed)) setResult(parsed);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const onWhatsAppClick = useCallback((productId: string, submissionId: string) => {
    trackWhatsAppClick(productId, submissionId);
  }, []);

  if (loading) {
    return <p aria-live="polite" className="rounded-3xl border border-[var(--line)] bg-white p-8 text-center text-[var(--muted)]">Loading your saved matches…</p>;
  }

  if (!result) {
    return (
      <section className="rounded-3xl border border-[var(--line)] bg-white p-7 text-center sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">No saved results</p>
        <h1 className="mt-3 text-3xl font-semibold">Your quiz results are not available in this browser session.</h1>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-[var(--muted)]">Complete the five questions again to get a fresh shortlist from the current product catalogue.</p>
        <Link className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[var(--leaf)] px-6 font-semibold text-white hover:bg-[var(--leaf-dark)]" href="/quiz">Start the quiz</Link>
      </section>
    );
  }

  const { answers, recommendations, whatsappNumber, submissionId } = result;
  return (
    <div>
      <section className="rounded-3xl bg-[#e8eee6] p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Your answers</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm text-[var(--muted)]">Budget</p><p className="mt-1 font-semibold">{answers.budgetLabel} · ₦{answers.budget.toLocaleString("en-NG")}</p></div>
          <div><p className="text-sm text-[var(--muted)]">Top priorities</p><p className="mt-1 font-semibold">{prioritySummary}</p></div>
          <div><p className="text-sm text-[var(--muted)]">Primary usage</p><p className="mt-1 font-semibold">{USAGE_LABELS[answers.usage]}</p></div>
        </div>
      </section>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Your phone matches</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your Phone Matches Are Ready!</h1>
        </div>
        <Link className="text-sm font-semibold text-[var(--leaf)] underline-offset-4 hover:underline" href="/quiz?edit=1">Change your answers</Link>
      </div>

      {recommendations.length > 0 ? (
        <div className="mt-6 space-y-5">
          {recommendations.map((recommendation) => (
            <ProductMatchCard
              key={recommendation.product.id}
              answers={answers}
              onWhatsAppClick={onWhatsAppClick}
              recommendation={recommendation}
              submissionId={submissionId}
              whatsappNumber={whatsappNumber}
            />
          ))}
          <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-[var(--muted)]">Availability and prices can change. Confirm the final details with the vendor. Match classifications reflect this catalogue and your answers, not independent industry ratings.</p>
        </div>
      ) : (
        <section className="mt-6 rounded-3xl border border-[var(--line)] bg-white p-7 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">No suitable phones right now</p>
          <h2 className="mt-3 text-2xl font-semibold">We couldn’t find an available match for these answers.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">We don’t invent products to fill your shortlist. You can try different answers, or ask the vendor whether something suitable is available.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--leaf)] px-6 font-semibold text-white hover:bg-[var(--leaf-dark)]" href="/quiz" onClick={restartQuiz}>Start a new quiz</Link>
            {whatsappNumber ? (
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--leaf)] px-6 font-semibold text-[var(--leaf)] hover:bg-[#edf6df]"
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I used Phone Match with a budget of ₦${answers.budget.toLocaleString("en-NG")} and priorities of ${prioritySummary}. Could you let me know if a suitable phone is available?`)}`}
                onClick={() => onWhatsAppClick("", submissionId)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Ask the vendor on WhatsApp
              </a>
            ) : <p className="text-sm text-[var(--muted)]">Vendor contact details are not configured yet.</p>}
          </div>
        </section>
      )}
      <p className="mt-6 text-center text-sm text-[var(--muted)]">Considering a London-used phone? Each used match includes a general inspection checklist. It is not a device inspection record.</p>
    </div>
  );
}
