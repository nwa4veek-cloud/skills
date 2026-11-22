import { describe, expect, it } from "vitest";
import { DEFAULT_RECOMMENDATION_CONFIG, recommendProducts } from "@/lib/recommendations";
import type { Product, QuizAnswers } from "@/lib/types";

const answers: QuizAnswers = {
  budget: 100_000,
  budgetLabel: "₦100,000–₦150,000",
  priorities: ["camera", "battery"],
  usage: "gaming",
  condition: "BOTH",
  flexibility: "STRICT",
};

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    brand: "Example",
    model: "Phone A",
    name: "Example Phone A",
    price: 100_000,
    condition: "NEW",
    ram: "8 GB",
    storage: "128 GB",
    processor: "Example processor",
    display: "6.1-inch OLED",
    camera: "50 MP main camera",
    battery: "5,000 mAh",
    battery_health: null,
    physical_condition: null,
    warranty: "12-month vendor warranty",
    image_path: null,
    available: true,
    active: true,
    description: "Product details supplied by the vendor.",
    matching_attributes: {
      camera: 5,
      battery: 4,
      performance: 3,
      storage: 3,
      display: 3,
      durability: 3,
      value: 3,
    },
    usage_suitability: {
      social: "general",
      photography: "exact",
      gaming: "exact",
      business: "related",
      content: "related",
      general: "general",
    },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("recommendProducts", () => {
  it("applies budget ceilings for strict, slight and flexible answers", () => {
    const aboveBudget = product({ id: "00000000-0000-4000-8000-000000000002", price: 110_000 });

    expect(recommendProducts(answers, [aboveBudget])).toHaveLength(0);
    expect(recommendProducts({ ...answers, flexibility: "SLIGHT" }, [aboveBudget])).toHaveLength(1);
    expect(recommendProducts({ ...answers, flexibility: "FLEXIBLE" }, [product({ price: 120_000 })])).toHaveLength(1);
    expect(recommendProducts({ ...answers, flexibility: "SLIGHT" }, [product({ price: 110_001 })])).toHaveLength(0);
  });

  it.each([
    ["NEW_ONLY", "NEW", 1],
    ["NEW_ONLY", "LONDON_USED", 0],
    ["LONDON_USED_ONLY", "LONDON_USED", 1],
    ["LONDON_USED_ONLY", "NEW", 0],
    ["BOTH", "NEW", 1],
    ["BOTH", "LONDON_USED", 1],
  ] as const)("respects %s condition for %s phones", (preference, condition, expectedCount) => {
    expect(
      recommendProducts(
        { ...answers, condition: preference },
        [product({ condition })],
      ),
    ).toHaveLength(expectedCount);
  });

  it("normalizes priority ratings and uses the configured scoring formula", () => {
    const matches = recommendProducts(answers, [product()]);

    expect(matches[0].score).toBe(91);
    expect(matches[0].classification).toBe("Excellent Match");
    expect(matches[0].explanation).toContain("stronger fit for camera quality");
    expect(matches[0].explanation).toContain("stronger fit for battery life");
  });

  it("ranks matching usage above otherwise equal products", () => {
    const notMatched = product({
      id: "00000000-0000-4000-8000-000000000002",
      usage_suitability: { ...product().usage_suitability, gaming: "none" },
    });

    expect(recommendProducts(answers, [notMatched, product()]).map((match) => match.product.id)).toEqual([
      product().id,
      notMatched.id,
    ]);
  });

  it("excludes products missing a rating, unavailable stock or inactive catalogue status", () => {
    const missingRating = product({
      matching_attributes: {
        camera: 5,
        battery: 4,
        performance: 3,
        storage: 3,
        display: 3,
        durability: 3,
      } as Product["matching_attributes"],
    });

    expect(
      recommendProducts(answers, [
        missingRating,
        product({ id: "00000000-0000-4000-8000-000000000002", available: false }),
        product({ id: "00000000-0000-4000-8000-000000000003", active: false }),
      ]),
    ).toEqual([]);
  });

  it("uses price and then stable product id for equal scores, returning at most three", () => {
    const products = [
      product({ id: "00000000-0000-4000-8000-000000000003", price: 95_000 }),
      product({ id: "00000000-0000-4000-8000-000000000002", price: 90_000 }),
      product({ id: "00000000-0000-4000-8000-000000000001", price: 90_000 }),
      product({ id: "00000000-0000-4000-8000-000000000004", price: 100_000 }),
    ];

    expect(recommendProducts(answers, products).map((match) => match.product.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
    ]);
  });

  it("returns empty and single-item results without inventing products", () => {
    expect(recommendProducts(answers, [])).toEqual([]);
    expect(recommendProducts(answers, [product()])).toHaveLength(1);
  });

  it("supports a configured lower minimum and classifies below-fair matches as weak", () => {
    const config = {
      ...DEFAULT_RECOMMENDATION_CONFIG,
      minimumScore: 40,
      thresholds: { excellent: 85, good: 70, fair: 55 },
    };
    const lowMatch = product({
      matching_attributes: {
        camera: 3,
        battery: 3,
        performance: 1,
        storage: 1,
        display: 1,
        durability: 1,
        value: 1,
      },
      usage_suitability: {
        social: "none",
        photography: "none",
        gaming: "none",
        business: "none",
        content: "none",
        general: "none",
      },
    });

    expect(recommendProducts(answers, [lowMatch], config)[0].classification).toBe("Weak Match");
  });

  it("includes the inspection checklist only for London-used recommendations", () => {
    const usedPhone = product({ condition: "LONDON_USED", battery_health: 86 });
    const newPhone = product({ condition: "NEW" });

    expect(recommendProducts(answers, [usedPhone])[0].checklist?.length).toBeGreaterThan(0);
    expect(recommendProducts(answers, [newPhone])[0].checklist).toBeNull();
  });
});
