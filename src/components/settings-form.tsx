"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidSettings, type AppSettings } from "@/lib/settings";

const WEIGHT_FIELDS = [
  ["priorityOne", "Priority one"],
  ["priorityTwo", "Priority two"],
  ["usage", "Usage"],
  ["budget", "Budget"],
] as const;

const SCORE_FIELDS = [
  ["minimumScore", "Minimum match score"],
  ["fair", "Fair match from"],
  ["good", "Good match from"],
  ["excellent", "Excellent match from"],
] as const;

type SettingNumberKey =
  | "priorityOne"
  | "priorityTwo"
  | "usage"
  | "budget"
  | "minimumScore"
  | "fair"
  | "good"
  | "excellent";

type SettingsNumberFieldProps = {
  field: SettingNumberKey;
  label: string;
  value: number;
  max: number;
  min?: number;
  step?: number;
  onChange: (field: SettingNumberKey, value: number) => void;
};

const SettingsNumberField = memo(function SettingsNumberField({ field, label, value, max, min = 0, step = 1, onChange }: SettingsNumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3" max={max} min={min} onChange={(event) => onChange(field, Number(event.target.value))} step={step} type="number" value={value} />
    </label>
  );
});

export function SettingsForm({ initialSettings }: { initialSettings: AppSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [budgetRangesJson, setBudgetRangesJson] = useState(JSON.stringify(initialSettings.budgetRanges, null, 2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const weightTotal = useMemo(
    () => Object.values(settings.recommendation.weights).reduce((sum, weight) => sum + weight, 0),
    [settings.recommendation.weights],
  );

  const updatePercentage = useCallback((key: "SLIGHT" | "FLEXIBLE", value: number) => {
    setSettings((current) => ({
      ...current,
      recommendation: {
        ...current.recommendation,
        flexibilityPercentages: { ...current.recommendation.flexibilityPercentages, [key]: value },
      },
    }));
  }, []);

  const updateNumericSetting = useCallback((key: SettingNumberKey, value: number) => {
    setSettings((current) => {
      if (key === "priorityOne" || key === "priorityTwo" || key === "usage" || key === "budget") {
        return {
          ...current,
          recommendation: {
            ...current.recommendation,
            weights: { ...current.recommendation.weights, [key]: value },
          },
        };
      }
      if (key === "minimumScore") {
        return { ...current, recommendation: { ...current.recommendation, minimumScore: value } };
      }
      return {
        ...current,
        recommendation: {
          ...current.recommendation,
          thresholds: { ...current.recommendation.thresholds, [key]: value },
        },
      };
    });
  }, []);

  const saveSettings = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    let budgetRanges: AppSettings["budgetRanges"];
    try {
      budgetRanges = JSON.parse(budgetRangesJson) as AppSettings["budgetRanges"];
    } catch {
      setError("Budget ranges must be valid JSON.");
      return;
    }

    const updated: AppSettings = { ...settings, budgetRanges };
    if (!isValidSettings(updated)) {
      setError("Check that the WhatsApp number is in international digits, there are seven unique non-overlapping budget ranges, recommendation weights total 1, and all score thresholds are valid.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Settings could not be saved.");
      setSettings(updated);
      setBudgetRangesJson(JSON.stringify(updated.budgetRanges, null, 2));
      setNotice("Settings saved.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Settings could not be saved.");
    } finally {
      setBusy(false);
    }
  }, [budgetRangesJson, router, settings]);

  return (
    <form className="space-y-7" onSubmit={saveSettings}>
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Application setup</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Phone Match settings</h1>
        <p className="mt-2 leading-6 text-[var(--muted)]">Public settings are used by the five-question quiz and product enquiry links. Never add keys or passwords here.</p>
      </header>

      <section className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">WhatsApp contact</h2>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">WhatsApp number (international digits only)</span>
          <input
            autoComplete="tel"
            className="min-h-12 w-full rounded-xl border border-[var(--line)] px-4 sm:max-w-md"
            inputMode="numeric"
            onChange={(event) => setSettings((current) => ({ ...current, whatsappNumber: event.target.value.replace(/\D/g, "") }))}
            placeholder="Add your business number"
            value={settings.whatsappNumber}
          />
          <span className="mt-2 block text-sm text-[var(--muted)]">The number is public and appears in customer WhatsApp links. Use the international country code without a plus sign.</span>
        </label>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Quiz budget ranges</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Configure the first six customer-facing ranges in ascending, non-overlapping order. The seventh range is for a custom amount. Each item requires a unique label and a minimum/maximum in naira; use <code className="rounded bg-[var(--paper)] px-1">null</code> as the maximum for an open-ended range.</p>
        <label className="mt-4 block">
          <span className="sr-only">Budget ranges JSON</span>
          <textarea
            className="min-h-80 w-full rounded-xl border border-[var(--line)] p-4 font-mono text-sm leading-6"
            onChange={(event) => setBudgetRangesJson(event.target.value)}
            spellCheck={false}
            value={budgetRangesJson}
          />
        </label>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Budget flexibility</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Strict budgets cannot be changed. Other flexibility percentages can be configured from 0% to 100% above the customer’s stated amount.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Strict</span>
            <input className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[#f2f4f0] px-3" disabled type="number" value={settings.recommendation.flexibilityPercentages.STRICT} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Slightly flexible (%)</span>
            <input className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3" max={100} min={0} onChange={(event) => updatePercentage("SLIGHT", Number(event.target.value))} type="number" value={settings.recommendation.flexibilityPercentages.SLIGHT} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Flexible (%)</span>
            <input className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3" max={100} min={0} onChange={(event) => updatePercentage("FLEXIBLE", Number(event.target.value))} type="number" value={settings.recommendation.flexibilityPercentages.FLEXIBLE} />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Recommendation weights and score thresholds</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Weights must total exactly 1 (100%). Priority one and two default to 0.35 each, usage to 0.20 and budget to 0.10. Scores range from 0 to 100.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WEIGHT_FIELDS.map(([key, label]) => (
            <SettingsNumberField
              field={key}
              key={key}
              label={`${label} weight`}
              max={1}
              min={0}
              onChange={updateNumericSetting}
              step={0.01}
              value={settings.recommendation.weights[key]}
            />
          ))}
        </div>
        <p className={`mt-3 text-sm font-semibold ${Math.abs(weightTotal - 1) < 0.0001 ? "text-[var(--leaf)]" : "text-amber-800"}`}>Weight total: {weightTotal.toFixed(2)} / 1.00</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCORE_FIELDS.map(([key, label]) => {
            const value = key === "minimumScore"
              ? settings.recommendation.minimumScore
              : settings.recommendation.thresholds[key];
            return (
              <SettingsNumberField field={key} key={key} label={label} max={100} onChange={updateNumericSetting} value={value} />
            );
          })}
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p> : null}
      {notice ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{notice}</p> : null}
      <button className="min-h-12 rounded-full bg-[var(--leaf)] px-7 font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-70" disabled={busy} type="submit">{busy ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
