"use client";

import { memo } from "react";
import type { Priority, Usage } from "@/lib/types";

type AttributeFieldProps = {
  attribute: Priority;
  label: string;
  value: number;
  onChange: (attribute: Priority, value: number) => void;
};

export const ProductRatingField = memo(function ProductRatingField({ attribute, label, value, onChange }: AttributeFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label} <span className="text-[var(--muted)]">(1–5)</span></span>
      <input className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3" max={5} min={1} onChange={(event) => onChange(attribute, Number(event.target.value))} required type="number" value={value} />
    </label>
  );
});

type SuitabilityFieldProps = {
  usage: Usage;
  label: string;
  value: "exact" | "related" | "general" | "none";
  onChange: (usage: Usage, value: SuitabilityFieldProps["value"]) => void;
};

export const ProductSuitabilityField = memo(function ProductSuitabilityField({ usage, label, value, onChange }: SuitabilityFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3" onChange={(event) => onChange(usage, event.target.value as SuitabilityFieldProps["value"])} required value={value}>
        <option value="exact">Exact match</option>
        <option value="related">Related use</option>
        <option value="general">General use</option>
        <option value="none">No meaningful match</option>
      </select>
    </label>
  );
});
