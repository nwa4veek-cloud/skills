"use client";

import { memo } from "react";

type ChoiceTileProps = {
  name: string;
  value: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: (value: string) => void;
};

export const ChoiceTile = memo(function ChoiceTile({
  name,
  value,
  label,
  description,
  selected,
  onSelect,
}: ChoiceTileProps) {
  return (
    <label className={`block cursor-pointer rounded-2xl border p-4 transition hover:border-[var(--leaf)] ${selected ? "border-[var(--leaf)] bg-[#edf6df] ring-1 ring-[var(--leaf)]" : "border-[var(--line)] bg-white"}`}>
      <span className="flex items-start gap-3">
        <input
          checked={selected}
          className="mt-1 size-4 accent-[#17684d]"
          name={name}
          onChange={() => onSelect(value)}
          type="radio"
          value={value}
        />
        <span>
          <span className="block font-semibold">{label}</span>
          {description ? <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{description}</span> : null}
        </span>
      </span>
    </label>
  );
});
