import { Check, X } from "lucide-react";

import type { Question } from "@/lib/data";
import { choicesOf } from "@/lib/sessions";
import { cn } from "@/lib/utils";

/** Renders passage text; lines like "Label: a | b | c" become a small data table. */
export function Passage({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ({ kind: "p"; text: string } | { kind: "table"; rows: string[][] })[] = [];
  for (const line of lines) {
    if (line.includes(" | ")) {
      const [head, rest] = line.includes(":")
        ? [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1)]
        : ["", line];
      const cells = [head.trim(), ...rest.split("|").map((c) => c.trim())].filter(
        (c, i) => i > 0 || c,
      );
      const last = blocks[blocks.length - 1];
      if (last?.kind === "table") last.rows.push(cells);
      else blocks.push({ kind: "table", rows: [cells] });
    } else if (line.trim()) {
      blocks.push({ kind: "p", text: line });
    }
  }
  return (
    <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-[15px] leading-relaxed text-navy">
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p
            key={i}
            className={i === 0 && blocks[1]?.kind === "table" ? "text-sm font-semibold" : ""}
          >
            {b.text}
          </p>
        ) : (
          <div key={i} className="overflow-x-auto">
            <table className="tabular w-full border-collapse text-sm">
              <tbody>
                {b.rows.map((r, ri) => (
                  <tr key={ri} className="border-b last:border-0">
                    {r.map((c, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          "px-2 py-1.5",
                          ci === 0 ? "font-semibold whitespace-nowrap" : "text-center",
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </div>
  );
}

export function ChoiceList({
  question,
  selected,
  onSelect,
  reveal,
  disabled,
}: {
  question: Question;
  selected: number | null;
  onSelect?: (i: number) => void;
  /** show correct/incorrect styling */
  reveal?: boolean;
  disabled?: boolean;
}) {
  const choices = choicesOf(question);
  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Answer choices">
      {choices.map((c, i) => {
        const isSel = selected === i;
        const isRight = i === question.correct_index;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSel}
            disabled={disabled}
            onClick={() => onSelect?.(i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left text-[15px] text-navy transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              !reveal && isSel && "border-primary bg-accent ring-1 ring-primary",
              !reveal && !disabled && !isSel && "hover:border-primary/40",
              reveal && isRight && "border-success bg-success-soft",
              reveal && isSel && !isRight && "border-destructive/50 bg-destructive/5",
              disabled && "cursor-default",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background text-xs font-bold",
                !reveal && isSel && "border-primary bg-primary text-primary-foreground",
                reveal && isRight && "border-success bg-success text-success-foreground",
                reveal && isSel && !isRight && "border-destructive bg-destructive text-white",
              )}
            >
              {reveal && isRight ? (
                <Check className="size-4" />
              ) : reveal && isSel ? (
                <X className="size-4" />
              ) : (
                "ABCDE"[i]
              )}
            </span>
            <span className="flex-1">{c}</span>
          </button>
        );
      })}
    </div>
  );
}
