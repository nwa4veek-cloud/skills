"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChoiceTile } from "@/components/choice-tile";
import { PriorityChoice } from "@/components/priority-choice";
import { DEFAULT_BUDGET_RANGES } from "@/lib/settings";
import { DEFAULT_RECOMMENDATION_CONFIG } from "@/lib/recommendations";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  USAGES,
  USAGE_LABELS,
  type BudgetRange,
  type Priority,
  type PublicRecommendation,
  type QuizAnswers,
  type Usage,
} from "@/lib/types";

type ConfigResponse = {
  budgetRanges: BudgetRange[];
  whatsappNumber: string;
  whatsappConfigured: boolean;
  flexibilityPercentages: Record<QuizAnswers["flexibility"], number>;
};

type QuizResult = {
  submissionId: string;
  answers: QuizAnswers;
  customBudget: boolean;
  recommendations: PublicRecommendation[];
  whatsappNumber: string;
};

const CONDITIONS: { value: QuizAnswers["condition"]; label: string }[] = [
  { value: "NEW_ONLY", label: "Brand-new only" },
  { value: "LONDON_USED_ONLY", label: "London-used only" },
  { value: "BOTH", label: "Open to both" },
];

const FLEXIBILITY: { value: QuizAnswers["flexibility"]; label: string; description: string }[] = [
  { value: "STRICT", label: "No. My budget is strict.", description: "No recommendations above your budget." },
  { value: "SLIGHT", label: "Yes. I can add a little more.", description: "" },
  { value: "FLEXIBLE", label: "Yes. I am flexible if the value justifies it.", description: "" },
];

const INITIAL_ANSWERS = {
  budget: 0,
  budgetLabel: "",
  customBudget: false,
  priorities: [] as Priority[],
  usage: "" as Usage | "",
  condition: "" as QuizAnswers["condition"] | "",
  flexibility: "" as QuizAnswers["flexibility"] | "",
};

function trackEvent(eventName: string) {
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName }),
  }).catch(() => undefined);
}

export function Quiz() {
  const router = useRouter();
  const questionHeadingRef = useRef<HTMLLegendElement>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [budgetRanges, setBudgetRanges] = useState<BudgetRange[]>(DEFAULT_BUDGET_RANGES);
  const [flexibilityPercentages, setFlexibilityPercentages] = useState(
    DEFAULT_RECOMMENDATION_CONFIG.flexibilityPercentages,
  );
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [configurationNotice, setConfigurationNotice] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reloadConfig, setReloadConfig] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingConfig(true);
    fetch("/api/config", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Budget options could not be loaded.");
        return (await response.json()) as ConfigResponse;
      })
      .then((config) => {
        if (!Array.isArray(config.budgetRanges) || config.budgetRanges.length !== 7) {
          throw new Error("Budget options are not set up correctly.");
        }
        setBudgetRanges(config.budgetRanges);
        if (config.flexibilityPercentages) {
          setFlexibilityPercentages(config.flexibilityPercentages);
        }
        setWhatsappNumber(typeof config.whatsappNumber === "string" ? config.whatsappNumber : "");
        setConfigurationNotice("");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setConfigurationNotice(
            error instanceof Error ? `${error.message} Default options are shown; you can retry.` : "Default options are shown.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingConfig(false);
      });

    return () => controller.abort();
  }, [reloadConfig]);

  useEffect(() => {
    trackEvent("quiz_started");
  }, []);

  useEffect(() => {
    questionHeadingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("edit") !== "1") return;
    try {
      const savedResultText = window.sessionStorage.getItem("phone-match-result");
      if (!savedResultText) return;
      const stored: unknown = JSON.parse(savedResultText);
      if (!stored || typeof stored !== "object" || !("answers" in stored)) return;
      const savedResult = stored as { answers: QuizAnswers; customBudget?: boolean };
      const previous = savedResult.answers;
      if (
        !Array.isArray(previous.priorities) ||
        previous.priorities.length !== 2 ||
        !previous.budgetLabel ||
        !previous.usage ||
        !previous.condition ||
        !previous.flexibility
      ) return;
      setAnswers({
        ...previous,
        customBudget: savedResult.customBudget === true,
      });
    } catch {
      setSubmissionError("Your previous answers could not be restored. You can still start a new quiz.");
    }
  }, []);

  const selectedPriorities = useMemo(() => new Set(answers.priorities), [answers.priorities]);
  const selectedRange = useMemo(
    () => budgetRanges.find((range) => range.label === answers.budgetLabel),
    [budgetRanges, answers.budgetLabel],
  );
  const customBudgetValid = useMemo(
    () =>
      !!selectedRange &&
      answers.budget >= selectedRange.min &&
      (selectedRange.max === null || answers.budget <= selectedRange.max),
    [answers.budget, selectedRange],
  );
  const flexibilityOptions = useMemo(
    () =>
      FLEXIBILITY.map((option) => ({
        ...option,
        description:
          option.value === "STRICT"
            ? option.description
            : `Consider phones up to ${flexibilityPercentages[option.value]}% above your budget.`,
      })),
    [flexibilityPercentages],
  );
  const progressWidth = useMemo(() => `${((step + 1) / 5) * 100}%`, [step]);

  const chooseBudget = useCallback((label: string) => {
    const range = budgetRanges.find((option) => option.label === label);
    if (!range) return;
    const isCustom = range === budgetRanges[budgetRanges.length - 1];
    setAnswers((current) => ({
      ...current,
      budgetLabel: label,
      customBudget: isCustom,
      budget: isCustom ? range.min : range.max ?? range.min,
    }));
  }, [budgetRanges]);

  const togglePriority = useCallback((priority: Priority) => {
    setAnswers((current) => {
      if (current.priorities.includes(priority)) {
        return { ...current, priorities: current.priorities.filter((item) => item !== priority) };
      }
      if (current.priorities.length >= 2) return current;
      return { ...current, priorities: [...current.priorities, priority] };
    });
  }, []);

  const chooseUsage = useCallback((value: string) => {
    setAnswers((current) => ({ ...current, usage: value as Usage }));
  }, []);

  const chooseCondition = useCallback((value: string) => {
    setAnswers((current) => ({ ...current, condition: value as QuizAnswers["condition"] }));
  }, []);

  const chooseFlexibility = useCallback((value: string) => {
    setAnswers((current) => ({ ...current, flexibility: value as QuizAnswers["flexibility"] }));
  }, []);

  const updateBudgetValue = useCallback((value: string) => {
    const amount = value === "" ? 0 : Number(value);
    setAnswers((current) => ({ ...current, budget: Number.isSafeInteger(amount) ? amount : 0 }));
  }, []);

  const currentStepValid = useMemo(() => {
    if (step === 0) return answers.budget > 0 && (!answers.customBudget || customBudgetValid);
    if (step === 1) return answers.priorities.length === 2;
    if (step === 2) return !!answers.usage;
    if (step === 3) return !!answers.condition;
    return !!answers.flexibility;
  }, [answers, customBudgetValid, step]);

  const handleNext = useCallback(() => {
    setSubmissionError("");
    if (!currentStepValid) {
      setSubmissionError(
        step === 1
          ? "Choose exactly two priorities to continue."
          : step === 0 && answers.customBudget && !customBudgetValid
            ? "Enter an amount within the selected budget range."
            : "Please choose an answer before continuing.",
      );
      return;
    }
    if (step < 4) setStep((current) => current + 1);
  }, [answers.customBudget, currentStepValid, customBudgetValid, step]);

  const handleSubmit = useCallback(async () => {
    if (!currentStepValid || answers.priorities.length !== 2 || !answers.usage || !answers.condition || !answers.flexibility) {
      setSubmissionError("Please complete all five questions before continuing.");
      return;
    }

    setSubmitting(true);
    setSubmissionError("");
    const payload = {
      budget: answers.budget,
      budgetLabel: answers.budgetLabel,
      customBudget: answers.customBudget,
      priorities: answers.priorities,
      usage: answers.usage,
      condition: answers.condition,
      flexibility: answers.flexibility,
    };

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "We could not load your matches.");
      }
      const quizResult: QuizResult = {
        ...result,
        customBudget: answers.customBudget,
        whatsappNumber,
      };
      window.sessionStorage.setItem("phone-match-result", JSON.stringify(quizResult));
      router.push("/results");
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not load your matches just now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [answers, currentStepValid, router, whatsappNumber]);

  return (
    <section aria-labelledby="quiz-title" className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-sm sm:p-9">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Phone finder</p>
        <p aria-live="polite" className="text-sm font-semibold text-[var(--muted)]">Question {step + 1} of 5</p>
      </div>
      <div aria-label={`Question ${step + 1} of 5`} className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf1ea]" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}>
        <div className="h-full rounded-full bg-[var(--leaf)] transition-all" style={{ width: progressWidth }} />
      </div>

      <div className="mt-8 min-h-80">
        {step === 0 ? (
          <fieldset>
            <legend id="quiz-title" ref={questionHeadingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">What is your budget for a smartphone?</legend>
            <p className="mt-2 text-sm text-[var(--muted)]">Choose a range to get started. For “Above ₦500,000,” the starting amount is ₦500,001.</p>
            {loadingConfig ? <p aria-live="polite" className="mt-4 text-sm text-[var(--muted)]">Loading budget options…</p> : null}
            {configurationNotice ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" role="status">
                {configurationNotice}{" "}
                <button className="font-semibold underline" onClick={() => setReloadConfig((current) => current + 1)} type="button">Retry</button>
              </p>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {budgetRanges.map((range) => (
                <ChoiceTile
                  key={range.label}
                  label={range.label}
                  name="budget-range"
                  onSelect={chooseBudget}
                  selected={answers.budgetLabel === range.label}
                  value={range.label}
                />
              ))}
            </div>
            {answers.customBudget && selectedRange ? (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold">Your budget amount (₦)</span>
                <input
                  aria-describedby="custom-budget-help"
                  className="min-h-12 w-full rounded-xl border border-[var(--line)] px-4 outline-none focus:border-[var(--leaf)]"
                  inputMode="numeric"
                  max={selectedRange.max ?? undefined}
                  min={selectedRange.min}
                  onChange={(event) => updateBudgetValue(event.target.value)}
                  type="number"
                  value={answers.budget || ""}
                />
                <span className="mt-2 block text-sm text-[var(--muted)]" id="custom-budget-help">Enter a whole amount between ₦{selectedRange.min.toLocaleString("en-NG")} and ₦{(selectedRange.max ?? 100_000_000).toLocaleString("en-NG")}.</span>
              </label>
            ) : null}
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset>
            <legend id="quiz-title" ref={questionHeadingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">What are the TWO most important things you want in a smartphone?</legend>
            <p className="mt-2 text-sm text-[var(--muted)]"><span aria-live="polite">{answers.priorities.length} of 2 selected.</span> Choosing two helps us focus on what matters to you.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PRIORITIES.map((priority) => (
                <PriorityChoice
                  key={priority}
                  disabled={!selectedPriorities.has(priority) && answers.priorities.length === 2}
                  label={PRIORITY_LABELS[priority]}
                  onToggle={togglePriority}
                  selected={selectedPriorities.has(priority)}
                  value={priority}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset>
            <legend id="quiz-title" ref={questionHeadingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">What will you primarily use your phone for?</legend>
            <div className="mt-6 grid gap-3">
              {USAGES.map((usage) => (
                <ChoiceTile
                  key={usage}
                  label={USAGE_LABELS[usage]}
                  name="usage"
                  onSelect={chooseUsage}
                  selected={answers.usage === usage}
                  value={usage}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset>
            <legend id="quiz-title" ref={questionHeadingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">Which type of smartphone would you prefer?</legend>
            <div className="mt-6 grid gap-3">
              {CONDITIONS.map((condition) => (
                <ChoiceTile
                  key={condition.value}
                  label={condition.label}
                  name="condition"
                  onSelect={chooseCondition}
                  selected={answers.condition === condition.value}
                  value={condition.value}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 4 ? (
          <fieldset>
            <legend id="quiz-title" ref={questionHeadingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">If a better phone is slightly above your budget, would you consider it?</legend>
            <div className="mt-6 grid gap-3">
              {flexibilityOptions.map((option) => (
                <ChoiceTile
                  key={option.value}
                  description={option.description}
                  label={option.label}
                  name="flexibility"
                  onSelect={chooseFlexibility}
                  selected={answers.flexibility === option.value}
                  value={option.value}
                />
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>

      {submissionError ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800" role="alert">{submissionError}</p> : null}
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
        <button
          className="min-h-12 rounded-full border border-[var(--line)] px-5 font-semibold text-[var(--ink)] hover:border-[var(--leaf)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={step === 0 || submitting}
          onClick={() => {
            setSubmissionError("");
            setStep((current) => Math.max(0, current - 1));
          }}
          type="button"
        >
          Back
        </button>
        {step < 4 ? (
          <button className="min-h-12 rounded-full bg-[var(--leaf)] px-6 font-semibold text-white hover:bg-[var(--leaf-dark)]" onClick={handleNext} type="button">
            Continue <span aria-hidden="true" className="ml-1">→</span>
          </button>
        ) : (
          <button className="min-h-12 rounded-full bg-[var(--leaf)] px-6 font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:cursor-wait disabled:opacity-70" disabled={submitting} onClick={handleSubmit} type="button">
            {submitting ? "Finding your matches…" : "Show my matches"}
          </button>
        )}
      </div>
      {submitting ? <p aria-live="polite" className="mt-3 text-right text-sm text-[var(--muted)]">Checking available phones against your answers…</p> : null}
    </section>
  );
}
