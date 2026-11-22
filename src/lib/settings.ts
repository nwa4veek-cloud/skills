import type { BudgetRange } from "@/lib/types";
import {
  DEFAULT_RECOMMENDATION_CONFIG,
  type RecommendationConfig,
} from "@/lib/recommendations";

export const DEFAULT_BUDGET_RANGES: BudgetRange[] = [
  { label: "Below ₦100,000", min: 1, max: 99_999 },
  { label: "₦100,000–₦150,000", min: 100_000, max: 150_000 },
  { label: "₦150,000–₦200,000", min: 150_001, max: 200_000 },
  { label: "₦200,000–₦300,000", min: 200_001, max: 300_000 },
  { label: "₦300,000–₦500,000", min: 300_001, max: 500_000 },
  { label: "Above ₦500,000", min: 500_001, max: 100_000_000 },
  { label: "Enter a custom budget", min: 1, max: 100_000_000 },
];

export type AppSettings = {
  whatsappNumber: string;
  budgetRanges: BudgetRange[];
  recommendation: RecommendationConfig;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  budgetRanges: DEFAULT_BUDGET_RANGES,
  recommendation: DEFAULT_RECOMMENDATION_CONFIG,
};

export function isValidSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as Partial<AppSettings>;
  if (
    typeof settings.whatsappNumber !== "string" ||
    (settings.whatsappNumber !== "" && !/^\d{8,15}$/.test(settings.whatsappNumber)) ||
    !Array.isArray(settings.budgetRanges) ||
    settings.budgetRanges.length !== 7
  ) return false;

  const ranges = settings.budgetRanges;
  if (
    ranges.some(
      (range) =>
        !range ||
        typeof range.label !== "string" ||
        range.label.trim().length === 0 ||
        range.label.length > 60 ||
        !Number.isSafeInteger(range.min) ||
        range.min < 1 ||
        range.min > 100_000_000 ||
        (range.max !== null &&
          (!Number.isSafeInteger(range.max) || range.max < range.min || range.max > 100_000_000)),
    ) ||
    new Set(ranges.map((range) => range.label)).size !== 7
  ) return false;

  for (let index = 0; index < 6; index += 1) {
    const range = ranges[index];
    if (range.max === null) {
      if (index !== 5) return false;
    } else if (index < 5 && range.max >= ranges[index + 1].min) {
      return false;
    }
  }
  if (ranges[6].max === null) return false;

  const recommendation = settings.recommendation;
  if (!recommendation?.flexibilityPercentages || !recommendation.weights || !recommendation.thresholds) return false;
  const weights = recommendation.weights;
  const thresholds = recommendation.thresholds;
  const expectedWeightKeys = ["priorityOne", "priorityTwo", "usage", "budget"];
  const expectedFlexibilityKeys = ["STRICT", "SLIGHT", "FLEXIBLE"];
  return (
    Object.keys(weights).length === expectedWeightKeys.length &&
    expectedWeightKeys.every((key) => key in weights) &&
    Object.keys(recommendation.flexibilityPercentages).length === expectedFlexibilityKeys.length &&
    expectedFlexibilityKeys.every((key) => key in recommendation.flexibilityPercentages) &&
    recommendation.flexibilityPercentages.STRICT === 0 &&
    Number.isFinite(recommendation.flexibilityPercentages.SLIGHT) &&
    recommendation.flexibilityPercentages.SLIGHT >= 0 &&
    recommendation.flexibilityPercentages.SLIGHT <= 100 &&
    Number.isFinite(recommendation.flexibilityPercentages.FLEXIBLE) &&
    recommendation.flexibilityPercentages.FLEXIBLE >= 0 &&
    recommendation.flexibilityPercentages.FLEXIBLE <= 100 &&
    Object.values(weights).length === 4 &&
    Object.values(weights).every((weight) => Number.isFinite(weight) && weight >= 0 && weight <= 1) &&
    Math.abs(Object.values(weights).reduce((sum, weight) => sum + weight, 0) - 1) < 0.0001 &&
    Number.isInteger(recommendation.minimumScore) &&
    recommendation.minimumScore >= 0 &&
    recommendation.minimumScore <= 100 &&
    Number.isInteger(thresholds.fair) &&
    Number.isInteger(thresholds.good) &&
    Number.isInteger(thresholds.excellent) &&
    thresholds.fair >= recommendation.minimumScore &&
    thresholds.fair <= thresholds.good &&
    thresholds.good <= thresholds.excellent &&
    thresholds.excellent <= 100
  );
}
