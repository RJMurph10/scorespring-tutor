import { Check, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { Question } from "@/lib/data";
import { choicesOf } from "@/lib/sessions";
import { cn } from "@/lib/utils";

/** Renders **inline** __underlined__ portions (ACT English, SAT "underlined sentence" questions). */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(__[^_]+(?:_[^_]+)*__)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("__") && part.endsWith("__") ? (
          <u
            key={i}
            data-active=""
            className="decoration-primary decoration-2 underline-offset-4 bg-accent/70 rounded-sm px-0.5"
          >
            {part.slice(2, -2)}
          </u>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function isHeading(line: string) {
  const t = line.trim();
  return (
    /^(Passage [IVX]+|Table \d|Figure \d|Experiment \d|Study \d|Scientist \d|Text \d)/.test(t) ||
    (t.length < 60 && !/[.?!:"”)]$/.test(t) && !t.startsWith("•"))
  );
}

/**
 * Renders a passage or stimulus. Lines like "Label: a | b | c" become a data table, short title
 * lines become headings, and __text__ is underlined. Long passages scroll inside their own panel
 * and keep the underlined portion in view.
 */
export function Passage({ text, scroll = false }: { text: string; scroll?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const active = box?.querySelector("[data-active]") as HTMLElement | null;
    if (box && active && scroll) {
      box.scrollTop = Math.max(0, active.offsetTop - box.clientHeight / 3);
    }
  }, [text, scroll]);

  const lines = text.split("\n");
  const blocks: (
    { kind: "p"; text: string } | { kind: "h"; text: string } | { kind: "table"; rows: string[][] }
  )[] = [];
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
      blocks.push(isHeading(line) ? { kind: "h", text: line } : { kind: "p", text: line });
    }
  }
  return (
    <div
      ref={ref}
      className={cn(
        "relative space-y-3 rounded-xl border bg-muted/40 p-4 text-[15px] leading-relaxed text-navy",
        scroll && "max-h-[70vh] overflow-y-auto",
      )}
    >
      {blocks.map((b, i) =>
        b.kind === "h" ? (
          <p key={i} className="text-sm font-semibold">
            <Inline text={b.text} />
          </p>
        ) : b.kind === "p" ? (
          <p key={i}>
            <Inline text={b.text} />
          </p>
        ) : (
          <div key={i} className="overflow-x-auto rounded-lg border bg-card">
            <table className="tabular w-full border-collapse text-sm">
              <tbody>
                {b.rows.map((r, ri) => (
                  <tr key={ri} className={cn("border-b last:border-0", ri === 0 && "bg-muted/60")}>
                    {r.map((c, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          "px-2.5 py-1.5",
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
