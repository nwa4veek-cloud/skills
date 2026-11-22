"use client";

import { memo } from "react";
import type { Priority } from "@/lib/types";

type PriorityChoiceProps = {
  value: Priority;
  label: string;
  selected: boolean;
  disabled: boolean;
  onToggle: (value: Priority) => void;
};

export const PriorityChoice = memo(function PriorityChoice({
  value,
  label,
  selected,
  disabled,
  onToggle,
}: PriorityChoiceProps) {
  return (
    <label className={`block rounded-2xl border p-4 transition ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:border-[var(--leaf)]"} ${selected ? "border-[var(--leaf)] bg-[#edf6df] ring-1 ring-[var(--leaf)]" : "border-[var(--line)] bg-white"}`}>
      <span className="flex items-center gap-3">
        <input
          checked={selected}
          className="size-4 accent-[#17684d]"
          disabled={disabled}
          name="priority"
          onChange={() => onToggle(value)}
          type="checkbox"
          value={value}
        />
        <span className="font-semibold">{label}</span>
      </span>
    </label>
  );
});
