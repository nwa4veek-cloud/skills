"use client";

import { memo } from "react";

export type TextProductKey =
  | "brand"
  | "model"
  | "name"
  | "ram"
  | "storage"
  | "processor"
  | "display"
  | "camera"
  | "battery"
  | "physical_condition"
  | "warranty"
  | "description";

type ProductTextFieldProps = {
  field: TextProductKey;
  label: string;
  value: string;
  required?: boolean;
  maxLength?: number;
  onChange: (field: TextProductKey, value: string) => void;
};

export const ProductTextField = memo(function ProductTextField({
  field,
  label,
  value,
  required,
  maxLength,
  onChange,
}: ProductTextFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}{required ? " *" : ""}</span>
      <input
        className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3"
        maxLength={maxLength ?? 500}
        onChange={(event) => onChange(field, event.target.value)}
        required={required}
        value={value}
      />
    </label>
  );
});
