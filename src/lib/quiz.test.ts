import { describe, expect, it } from "vitest";
import { validateQuizAnswers } from "@/lib/quiz";
import { DEFAULT_BUDGET_RANGES } from "@/lib/settings";

const validAnswers = {
  budget: 150_000,
  budgetLabel: "₦100,000–₦150,000",
  customBudget: false,
  priorities: ["camera", "battery"],
  usage: "photography",
  condition: "BOTH",
  flexibility: "SLIGHT",
};

describe("validateQuizAnswers", () => {
  it("accepts a complete five-answer submission with exactly two priorities", () => {
    const result = validateQuizAnswers(validAnswers, DEFAULT_BUDGET_RANGES);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.answers.priorities).toEqual(["camera", "battery"]);
      expect(result.answers.budget).toBe(150_000);
    }
  });

  it("rejects a missing answer", () => {
    const incomplete: Partial<typeof validAnswers> = { ...validAnswers };
    delete incomplete.flexibility;

    expect(validateQuizAnswers(incomplete, DEFAULT_BUDGET_RANGES)).toMatchObject({
      valid: false,
      errors: expect.arrayContaining(["Choose a budget flexibility option."]),
    });
  });

  it.each([
    [["camera"], "Choose exactly two different priorities."],
    [["camera", "camera"], "Choose exactly two different priorities."],
    [["camera", "battery", "storage"], "Choose exactly two different priorities."],
    [["unknown", "battery"], "Choose exactly two different priorities."],
  ])("rejects an invalid priority selection %j", (priorities, expectedError) => {
    const result = validateQuizAnswers({ ...validAnswers, priorities }, DEFAULT_BUDGET_RANGES);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain(expectedError);
  });

  it("requires a custom amount inside the selected custom range", () => {
    const custom = {
      ...validAnswers,
      budget: 225_000,
      budgetLabel: "Enter a custom budget",
      customBudget: true,
    };

    expect(validateQuizAnswers(custom, DEFAULT_BUDGET_RANGES).valid).toBe(true);
    expect(validateQuizAnswers({ ...custom, budget: 0 }, DEFAULT_BUDGET_RANGES).valid).toBe(false);
    expect(validateQuizAnswers({ ...custom, budget: 225_000, customBudget: false }, DEFAULT_BUDGET_RANGES).valid).toBe(false);
  });

  it("rejects a forged amount outside the chosen non-custom range", () => {
    expect(
      validateQuizAnswers({ ...validAnswers, budget: 200_000 }, DEFAULT_BUDGET_RANGES).valid,
    ).toBe(false);
  });

  it("rejects malformed, zero and unsafe budgets and invalid option values", () => {
    expect(validateQuizAnswers(null, DEFAULT_BUDGET_RANGES).valid).toBe(false);
    expect(validateQuizAnswers({ ...validAnswers, budget: 0 }, DEFAULT_BUDGET_RANGES).valid).toBe(false);
    expect(validateQuizAnswers({ ...validAnswers, budget: Number.MAX_SAFE_INTEGER + 1 }, DEFAULT_BUDGET_RANGES).valid).toBe(false);
    expect(validateQuizAnswers({ ...validAnswers, usage: "work" }, DEFAULT_BUDGET_RANGES).valid).toBe(false);
    expect(validateQuizAnswers({ ...validAnswers, condition: "ANYTHING" }, DEFAULT_BUDGET_RANGES).valid).toBe(false);
  });
});
