import type { PublicProduct, Product, QuizAnswers } from "@/lib/types";
import { PRIORITY_LABELS, USAGE_LABELS } from "@/lib/types";

export function createWhatsAppUrl(
  phoneNumber: string,
  product: Product | PublicProduct,
  answers: QuizAnswers,
): string {
  const phone = phoneNumber.replace(/\D/g, "");
  const message = [
    `Hello, I found ${product.name} on Phone Match and would like to enquire.`,
    `My budget: ${answers.budgetLabel} (₦${answers.budget.toLocaleString("en-NG")}).`,
    `My priorities: ${answers.priorities.map((priority) => PRIORITY_LABELS[priority]).join(" and ")}.`,
    `My intended usage: ${USAGE_LABELS[answers.usage]}.`,
    "Please confirm availability, condition and final price. Thank you.",
  ].join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
