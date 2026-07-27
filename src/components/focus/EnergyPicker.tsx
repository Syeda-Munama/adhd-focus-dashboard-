"use client";

import { cn } from "@/lib/utils";
import type { EnergyLevel } from "@/types/task";

const OPTIONS: { value: EnergyLevel | null; label: string }[] = [
  { value: null, label: "Any" },
  { value: "LOW", label: "Low energy" },
  { value: "MEDIUM", label: "Some focus" },
  { value: "HIGH", label: "Deep focus" },
];

export function EnergyPicker({
  value,
  onChange,
}: {
  value: EnergyLevel | null;
  onChange: (value: EnergyLevel | null) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full bg-paper-border/60 p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-paper-card text-ink-text shadow-sm"
              : "text-ink-text-muted hover:text-ink-text"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
