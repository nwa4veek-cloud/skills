import {
  CONDITIONS,
  PRIORITIES,
  USAGES,
  type BudgetRange,
  type QuizAnswers,
} from "@/lib/types";

export type QuizValidationResult =
  | { valid: true; answers: QuizAnswers }
  | { valid: false; errors: string[] };

export function validateQuizAnswers(
  input: unknown,
  budgetRanges: BudgetRange[],
): QuizValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: ["Complete all five questions to see your matches."] };
  }

  const value = input as Record<string, unknown>;
  const errors: string[] = [];

  const budget =
    typeof value.budget === "number" && Number.isFinite(value.budget)
      ? value.budget
      : Number.NaN;
  const budgetLabel = typeof value.budgetLabel === "string" ? value.budgetLabel : "";
  const selectedRange = budgetRanges.find((range) => range.label === budgetLabel);

  if (!Number.isSafeInteger(budget) || budget <= 0 || budget > 100_000_000) {
    errors.push("Enter a valid budget greater than zero.");
  }
  if (!selectedRange) {
    errors.push("Choose a budget range.");
  } else if (value.customBudget === true && selectedRange === budgetRanges[budgetRanges.length - 1]) {
    if (budget < selectedRange.min || (selectedRange.max !== null && budget > selectedRange.max)) {
      errors.push("Your custom budget must fall within the selected budget range.");
    }
  } else if (selectedRange !== budgetRanges[budgetRanges.length - 1] && budget !== (selectedRange.max ?? selectedRange.min)) {
    errors.push("Choose an amount from the selected budget range.");
  } else if (selectedRange === budgetRanges[budgetRanges.length - 1]) {
    errors.push("Enter a custom budget amount.");
  }

  const priorities = value.priorities;
  if (
    !Array.isArray(priorities) ||
    priorities.length !== 2 ||
    priorities[0] === priorities[1] ||
    !priorities.every((item) => typeof item === "string" && PRIORITIES.includes(item as never))
  ) {
    errors.push("Choose exactly two different priorities.");
  }
  if (typeof value.usage !== "string" || !USAGES.includes(value.usage as never)) {
    errors.push("Choose your primary phone usage.");
  }
  if (
    typeof value.condition !== "string" ||
    !["NEW_ONLY", "LONDON_USED_ONLY", "BOTH"].includes(value.condition)
  ) {
    errors.push("Choose a condition preference.");
  }
  if (
    typeof value.flexibility !== "string" ||
    !["STRICT", "SLIGHT", "FLEXIBLE"].includes(value.flexibility)
  ) {
    errors.push("Choose a budget flexibility option.");
  }

  if (errors.length > 0) return { valid: false, errors };

  const selectedPriorities = priorities as [QuizAnswers["priorities"][0], QuizAnswers["priorities"][1]];
  const usage = value.usage as QuizAnswers["usage"];
  const condition = value.condition as QuizAnswers["condition"];
  const flexibility = value.flexibility as QuizAnswers["flexibility"];

  if (CONDITIONS.length !== 2) {
    return { valid: false, errors: ["Product condition options are not configured."] };
  }

  return {
    valid: true,
    answers: {
      budget,
      budgetLabel,
      priorities: selectedPriorities,
      usage,
      condition,
      flexibility,
    },
  };
}
