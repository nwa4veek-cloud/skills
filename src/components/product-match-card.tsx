"use client";

import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import { PRIORITY_LABELS, type PublicRecommendation, type QuizAnswers } from "@/lib/types";

type ProductMatchCardProps = {
  recommendation: PublicRecommendation;
  answers: QuizAnswers;
  whatsappNumber: string;
  submissionId: string;
  onWhatsAppClick: (productId: string, submissionId: string) => void;
};

function imageUrl(imagePath: string | null): string | null {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl || !imagePath) return null;
  return `${projectUrl.replace(/\/$/, "")}/storage/v1/object/public/product-images/${imagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

const ProductSpec = memo(function ProductSpec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
});

const DetailListItem = memo(function DetailListItem({ children }: { children: string }) {
  return <li>• {children}</li>;
});

const ChecklistListItem = memo(function ChecklistListItem({ children }: { children: string }) {
  return <li className="flex gap-2"><span aria-hidden="true">□</span><span>{children}</span></li>;
});

export const ProductMatchCard = memo(function ProductMatchCard({
  recommendation,
  answers,
  whatsappNumber,
  submissionId,
  onWhatsAppClick,
}: ProductMatchCardProps) {
  const { product } = recommendation;
  const src = useMemo(() => imageUrl(product.image_path), [product.image_path]);
  const priorities = useMemo(
    () => answers.priorities.map((priority) => PRIORITY_LABELS[priority]).join(" and "),
    [answers.priorities],
  );
  const specifications = useMemo(
    () =>
      [
        ["RAM", product.ram],
        ["Storage", product.storage],
        ["Processor", product.processor],
        ["Display", product.display],
        ["Camera", product.camera],
        ["Battery", product.battery],
        ["Battery health", product.battery_health === null ? null : `${product.battery_health}%`],
        ["Physical condition", product.physical_condition],
        ["Warranty", product.warranty],
      ].filter((item): item is [string, string] => !!item[1]),
    [product],
  );
  const whatsappUrl = useMemo(
    () => whatsappNumber ? createWhatsAppUrl(whatsappNumber, product, answers) : "",
    [answers, product, whatsappNumber],
  );
  const handleWhatsAppClick = useCallback(
    () => onWhatsAppClick(product.id, submissionId),
    [onWhatsAppClick, product.id, submissionId],
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-sm">
      <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
        <div className="relative min-h-56 bg-[#eef2eb] sm:min-h-full">
          {src ? (
            <Image alt={`${product.name} product image`} className="object-cover" fill sizes="(max-width: 640px) 100vw, 220px" src={src} />
          ) : (
            <div aria-label="No product image supplied" className="absolute inset-0 grid place-items-center text-center text-sm text-[var(--muted)]" role="img">
              <span><span aria-hidden="true" className="mb-2 block text-4xl">▣</span>Product image not provided</span>
            </div>
          )}
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{product.brand}</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">{product.name}</h3>
            </div>
            <span className="rounded-full bg-[#edf6df] px-3 py-1.5 text-xs font-bold text-[var(--leaf)]">{recommendation.classification}</span>
          </div>

          <p className="mt-3 text-2xl font-semibold text-[var(--leaf)]">₦{product.price.toLocaleString("en-NG")}</p>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">{product.condition === "NEW" ? "Brand-new" : "London-used"}</p>
          <p className="mt-4 leading-7 text-[var(--muted)]">{product.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {specifications.map(([label, value]) => <ProductSpec key={label} label={label} value={value} />)}
          </dl>

          <p className="mt-5 leading-7 text-[var(--muted)]">{recommendation.explanation}</p>
          <p className="mt-2 text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">Your priorities:</span> {priorities}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold">Why it may suit you</h4>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--muted)]">
                {recommendation.advantages.map((advantage) => <DetailListItem key={advantage}>{advantage}</DetailListItem>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Things to keep in mind</h4>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--muted)]">
                {recommendation.tradeOffs.map((tradeOff) => <DetailListItem key={tradeOff}>{tradeOff}</DetailListItem>)}
              </ul>
            </div>
          </div>

          {recommendation.checklist ? (
            <details className="mt-5 rounded-2xl bg-[#f3f6f0] p-4">
              <summary className="cursor-pointer font-semibold">London-used phone inspection checklist</summary>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">General advice only. This is not a record that this device has been inspected or verified.</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
                {recommendation.checklist.map((item) => <ChecklistListItem key={item}>{item}</ChecklistListItem>)}
              </ul>
            </details>
          ) : null}

          {whatsappNumber ? (
            <a
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--leaf)] px-5 text-center font-semibold text-white hover:bg-[var(--leaf-dark)] sm:w-auto"
              href={whatsappUrl}
              onClick={handleWhatsAppClick}
              rel="noopener noreferrer"
              target="_blank"
            >
              Ask about this phone on WhatsApp <span aria-hidden="true" className="ml-2">↗</span>
            </a>
          ) : (
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">WhatsApp enquiries are not configured yet. Contact details will be added by the vendor.</p>
          )}
        </div>
      </div>
    </article>
  );
});
