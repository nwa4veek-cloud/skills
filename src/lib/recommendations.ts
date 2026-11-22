import {
  PRIORITY_LABELS,
  PRIORITIES,
  USAGES,
  type MatchingAttributes,
  type Priority,
  type Product,
  type QuizAnswers,
  type Recommendation,
  USED_PHONE_CHECKLIST,
  type Usage,
} from "@/lib/types";

export type RecommendationConfig = {
  flexibilityPercentages: Record<QuizAnswers["flexibility"], number>;
  weights: { priorityOne: number; priorityTwo: number; usage: number; budget: number };
  minimumScore: number;
  thresholds: { excellent: number; good: number; fair: number };
};

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  flexibilityPercentages: { STRICT: 0, SLIGHT: 10, FLEXIBLE: 20 },
  weights: { priorityOne: 0.35, priorityTwo: 0.35, usage: 0.2, budget: 0.1 },
  minimumScore: 55,
  thresholds: { excellent: 85, good: 70, fair: 55 },
};

const USAGE_SCORE: Record<NonNullable<Product["usage_suitability"]>[Usage], number> = {
  exact: 100,
  related: 70,
  general: 60,
  none: 30,
};

function isValidProduct(product: Product): boolean {
  if (
    !product.id ||
    !product.name ||
    !product.brand ||
    !product.model ||
    !Number.isFinite(product.price) ||
    product.price <= 0 ||
    !product.description ||
    !product.matching_attributes ||
    !product.usage_suitability
  ) {
    return false;
  }
  return (
    PRIORITIES.every((priority) => {
      const rating = product.matching_attributes[priority];
      return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    }) &&
    USAGES.every((usage) =>
      ["exact", "related", "general", "none"].includes(product.usage_suitability[usage]),
    )
  );
}

function ratingToScore(rating: number): number {
  return ((rating - 1) / 4) * 100;
}

export function getBudgetCeiling(
  budget: number,
  flexibility: QuizAnswers["flexibility"],
  config: RecommendationConfig = DEFAULT_RECOMMENDATION_CONFIG,
): number {
  const percent = config.flexibilityPercentages[flexibility];
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return budget;
  return budget * (1 + percent / 100);
}

export function recommendProducts(
  answers: QuizAnswers,
  products: Product[],
  config: RecommendationConfig = DEFAULT_RECOMMENDATION_CONFIG,
): Recommendation[] {
  const [priorityOne, priorityTwo] = answers.priorities;
  const budgetCeiling = getBudgetCeiling(answers.budget, answers.flexibility, config);
  const eligible = products.filter((product) => {
    if (!isValidProduct(product) || !product.active || !product.available || product.price > budgetCeiling) {
      return false;
    }
    if (answers.condition === "NEW_ONLY" && product.condition !== "NEW") return false;
    if (answers.condition === "LONDON_USED_ONLY" && product.condition !== "LONDON_USED") return false;
    return true;
  });

  const ranked = eligible.map((product) => {
    const priorityOneScore = ratingToScore(product.matching_attributes[priorityOne]);
    const priorityTwoScore = ratingToScore(product.matching_attributes[priorityTwo]);
    const usageScore = USAGE_SCORE[product.usage_suitability[answers.usage]];
    const budgetScore = product.price <= answers.budget ? 100 : 70;
    const score =
      config.weights.priorityOne * priorityOneScore +
      config.weights.priorityTwo * priorityTwoScore +
      config.weights.usage * usageScore +
      config.weights.budget * budgetScore;

    return {
      product,
      score,
      priorityOneScore,
      priorityTwoScore,
      budgetScore,
      usageScore,
    };
  });

  return ranked
    .filter(({ score }) => score >= config.minimumScore)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.budgetScore - a.budgetScore ||
        a.product.price - b.product.price ||
        a.product.id.localeCompare(b.product.id),
    )
    .slice(0, 3)
    .map(({ product, score, priorityOneScore, priorityTwoScore }) => {
      const classification =
        score >= config.thresholds.excellent
          ? "Excellent Match"
          : score >= config.thresholds.good
            ? "Good Match"
            : score >= config.thresholds.fair
              ? "Fair Match"
              : "Weak Match";
      const strongAreas: Priority[] = [];
      const lowAreas: Priority[] = [];
      for (const [priority, rating] of Object.entries(product.matching_attributes) as [
        Priority,
        MatchingAttributes[Priority],
      ][]) {
        if (rating >= 4) strongAreas.push(priority);
        if (rating <= 2) lowAreas.push(priority);
      }

      const describeFit = (priorityScore: number) =>
        priorityScore >= 75 ? "stronger" : priorityScore >= 50 ? "moderate" : "lower";
      return {
        product,
        score: Math.round(score),
        classification,
        explanation: `This ${product.condition === "NEW" ? "brand-new" : "London-used"} ${product.name} is a match for your ${PRIORITY_LABELS[priorityOne].toLowerCase()} and ${PRIORITY_LABELS[priorityTwo].toLowerCase()} priorities. The vendor catalogue indicates a ${describeFit(priorityOneScore)} fit for ${PRIORITY_LABELS[priorityOne].toLowerCase()} and a ${describeFit(priorityTwoScore)} fit for ${PRIORITY_LABELS[priorityTwo].toLowerCase()}. ${product.price <= answers.budget ? "It is within your stated budget." : "It is above your stated budget but within the flexibility you selected."} Usage suitability is vendor-configured.`,
        advantages:
          strongAreas.length > 0
            ? strongAreas.slice(0, 3).map((priority) => `Strong catalogue match for ${PRIORITY_LABELS[priority].toLowerCase()}.`)
            : ["This phone meets the catalogue and budget requirements for your answers."],
        tradeOffs:
          lowAreas.length > 0
            ? lowAreas.slice(0, 2).map((priority) => `Lower catalogue match for ${PRIORITY_LABELS[priority].toLowerCase()}.`)
            : ["Confirm the specifications and final price directly with the vendor."],
        checklist: product.condition === "LONDON_USED" ? [...USED_PHONE_CHECKLIST] : null,
      };
    });
}
