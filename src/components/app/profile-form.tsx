import type { Exam } from "@/lib/domain/exams";
import { SCORE_RANGE } from "@/lib/domain/exams";
import { cn } from "@/lib/utils";

export type ProfileForm = {
  display_name: string;
  exam: "SAT" | "ACT" | "BOTH";
  active_exam: Exam;
  grade: string;
  current_score: string;
  knows_score: boolean;
  target_score: string;
  test_date: string;
  minutes_per_day: number;
  days_per_week: number;
  strengths: string[];
  weaknesses: string[];
  learning_style: "explanations" | "examples" | "practice" | "mixed";
  act_include_science: boolean;
  act_include_writing: boolean;
};

export const SUBJECTS: Record<Exam, string[]> = {
  SAT: ["Reading and Writing", "Math"],
  ACT: ["English", "Math", "Reading", "Science"],
};

export function validateScores(f: ProfileForm): string | null {
  const r = SCORE_RANGE[f.active_exam];
  const check = (v: string, label: string) => {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < r.min || n > r.max)
      return `${label} must be between ${r.min} and ${r.max} for the ${f.active_exam}.`;
    return null;
  };
  return (
    (f.knows_score ? check(f.current_score, "Current score") : null) ??
    check(f.target_score, "Target score")
  );
}

export function ChoiceGrid<T extends string>({
  value,
  options,
  onChange,
  multi,
  columns = 3,
}: {
  value: T | T[];
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  multi?: boolean;
  columns?: number;
}) {
  const selected = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 2
          ? "sm:grid-cols-2"
          : columns === 4
            ? "grid-cols-2 sm:grid-cols-4"
            : "sm:grid-cols-3",
      )}
      role={multi ? "group" : "radiogroup"}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role={multi ? "checkbox" : "radio"}
          aria-checked={selected(o.value)}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border bg-card px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            selected(o.value)
              ? "border-primary bg-accent ring-1 ring-primary"
              : "hover:border-primary/40",
          )}
        >
          <span className="block text-sm font-semibold text-navy">{o.label}</span>
          {o.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export function NumberChips({
  value,
  options,
  onChange,
  suffix,
}: {
  value: number;
  options: number[];
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={cn(
            "rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors",
            value === n
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-navy hover:border-primary/40",
          )}
        >
          {n}
          {suffix}
        </button>
      ))}
    </div>
  );
}
