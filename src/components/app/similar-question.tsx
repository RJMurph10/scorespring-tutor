import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { useRef, useState } from "react";

import { ChoiceList, Passage } from "@/components/app/question";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generateSimilarQuestion } from "@/lib/ai.functions";
import { useUserId, type Question } from "@/lib/data";
import { DEMO_AI_MESSAGE, isDemo } from "@/lib/demo";
import { distractorNote } from "@/lib/sessions";

/** "Try a similar question": AI-generated, independently verified, then answered inline and saved as an attempt. */
export function SimilarQuestion({ sourceId }: { sourceId: string }) {
  const uid = useUserId();
  const qc = useQueryClient();
  const [q, setQ] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const started = useRef(0);

  async function generate() {
    setLoading(true);
    setErr(null);
    setQ(null);
    setSelected(null);
    setChecked(false);
    if (isDemo()) {
      setErr(DEMO_AI_MESSAGE);
      setLoading(false);
      return;
    }
    try {
      const res = await generateSimilarQuestion({ data: { questionId: sourceId } });
      setQ(res);
      started.current = Date.now();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(
        msg.includes("not configured")
          ? "AI isn't configured for this project yet, so new questions can't be generated."
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  async function check() {
    if (!q || selected == null || !uid) return;
    setChecked(true);
    await supabase.from("question_attempts").insert({
      user_id: uid,
      question_id: q.id,
      kind: "practice",
      exam: q.exam,
      section: q.section,
      skill_id: q.skill_id,
      difficulty: q.difficulty,
      selected_index: selected,
      correct_index: q.correct_index,
      is_correct: selected === q.correct_index,
      time_ms: Date.now() - started.current,
    });
    qc.invalidateQueries({ queryKey: ["attempts"] });
  }

  if (!q && !loading && !err)
    return (
      <Button variant="outline" size="sm" onClick={generate}>
        <Wand2 className="size-4" /> Try a similar question
      </Button>
    );

  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-accent/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Similar question · AI-generated, verified
        </p>
        {(q || err) && !loading && (
          <Button variant="ghost" size="sm" onClick={generate}>
            Another
          </Button>
        )}
      </div>
      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Writing a new question and checking its answer
          key…
        </p>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {q && (
        <div className="space-y-3">
          {q.passage && <Passage text={q.passage} />}
          <p className="text-[15px] font-medium whitespace-pre-line text-navy">{q.prompt}</p>
          <ChoiceList
            question={q}
            selected={selected}
            onSelect={(i) => !checked && setSelected(i)}
            reveal={checked}
            disabled={checked}
          />
          {!checked ? (
            <Button size="sm" onClick={check} disabled={selected == null}>
              Check answer
            </Button>
          ) : (
            <div className="rounded-lg bg-card p-3 text-sm">
              <p
                className={
                  selected === q.correct_index
                    ? "font-semibold text-success"
                    : "font-semibold text-destructive"
                }
              >
                {selected === q.correct_index ? "Correct." : "Not quite."}
              </p>
              <p className="mt-1 text-navy">{q.explanation}</p>
              {selected != null && selected !== q.correct_index && distractorNote(q, selected) && (
                <p className="mt-1 text-muted-foreground">
                  Why your choice is tempting: {distractorNote(q, selected)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
