import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState, levelTone, LoadingState, Meter, Panel, pct } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { markTaskDone, useStudentModel, useUserId } from "@/lib/data";
import { LESSONS } from "@/lib/domain/lessons";
import { LEVEL_LABEL, MASTERY_MIN_ATTEMPTS } from "@/lib/domain/mastery";
import { useLaunchers } from "@/lib/launch";

export const Route = createFileRoute("/_authed/lessons/$skillId")({
  validateSearch: (s: Record<string, unknown>): { task?: string } =>
    typeof s["task"] === "string" ? { task: s["task"] } : {},
  head: () => ({ meta: [{ title: "Lesson — ScoreSpring" }] }),
  component: LessonPage,
});

function Example({ problem, steps }: { problem: string; steps: string[] }) {
  const [shown, setShown] = useState(1);
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="font-medium text-navy">{problem}</p>
      <ol className="mt-3 space-y-2">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-navy">
            <span className="tabular mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-primary">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      {shown < steps.length && (
        <button
          className="mt-3 flex items-center text-xs font-semibold text-primary"
          onClick={() => setShown((n) => n + 1)}
        >
          Show next step <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function LessonPage() {
  const { skillId } = Route.useParams();
  const { task } = Route.useSearch();
  const uid = useUserId();
  const m = useStudentModel();
  const L = useLaunchers();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;
  const skill = m.skills.find((s) => s.id === skillId);
  const lesson = LESSONS[skillId];
  if (!skill || !lesson) return <ErrorState error="Lesson not found" />;
  const st = skill.exam === m.exam ? m.stats.get(skillId) : undefined;
  const completed = m.completedLessons.has(skillId);
  const idx = m.skills.filter((s) => s.exam === skill.exam).findIndex((s) => s.id === skillId);
  const nextSkill = m.skills.filter((s) => s.exam === skill.exam)[idx + 1];

  async function complete() {
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: uid, skill_id: skillId });
    if (error) toast.error(error.message);
    else {
      await markTaskDone(task);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["lessons"] }),
        qc.invalidateQueries({ queryKey: ["tasks"] }),
      ]);
      toast.success("Lesson marked complete. Take the mastery check to prove the skill.");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/lessons"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" /> All lessons
      </Link>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {skill.exam} · {skill.section}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-navy sm:text-[28px]">{skill.domain}</h1>
      <p className="mt-1 text-muted-foreground">{skill.name}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Lesson</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-navy">
            {completed ? (
              <>
                <CheckCircle2 className="size-4 text-success" /> Completed
              </>
            ) : (
              "Not completed yet"
            )}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Demonstrated mastery</span>
            <span>{st ? `${LEVEL_LABEL[st.level]} · ${pct(st.mastery)}` : "No attempts yet"}</span>
          </div>
          <Meter
            value={st?.mastery ?? 0}
            tone={st ? levelTone(st.level) : "primary"}
            className="mt-2"
          />
          {st && st.level !== "mastered" && st.attempts < MASTERY_MIN_ATTEMPTS && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Mastered requires at least {MASTERY_MIN_ATTEMPTS} answered questions.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <Panel title="1 · The concept">
          <p className="text-[15px] leading-relaxed text-navy">{lesson.concept}</p>
          <Button variant="ghost" size="sm" className="mt-3 -ml-2" asChild>
            <Link
              to="/tutor"
              search={{
                q: `Teach me ${skill.exam} ${skill.domain.toLowerCase()} (${skill.name.toLowerCase()}) at my level, with one example, then quiz me.`,
              }}
            >
              <Sparkles className="size-4" /> Explain it differently with the AI tutor
            </Link>
          </Button>
        </Panel>

        <Panel
          title="2 · Worked examples"
          description="Try each step yourself before revealing it."
        >
          <div className="space-y-3">
            {lesson.examples.map((e, i) => (
              <Example key={i} problem={e.problem} steps={e.steps} />
            ))}
          </div>
        </Panel>

        <Panel title="3 · Common mistakes">
          <ul className="space-y-2">
            {lesson.mistakes.map((x) => (
              <li key={x} className="flex gap-2.5 text-sm text-navy">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                {x}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-5 sm:grid-cols-2">
          <Panel title="4 · Practice">
            <p className="text-sm text-muted-foreground">
              Five questions with hints and instant explanations.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              disabled={L.busy || skill.exam !== m.exam}
              onClick={() =>
                L.practice({ count: 5, timed: false, skillId, title: `Practice: ${skill.domain}` })
              }
            >
              <Target className="size-4" /> Practice this skill
            </Button>
          </Panel>
          <Panel title="5 · Mastery check">
            <p className="text-sm text-muted-foreground">
              No hints, feedback at the end. This is what moves your mastery level.
            </p>
            <Button
              className="mt-3"
              disabled={L.busy || skill.exam !== m.exam}
              onClick={() =>
                L.practice({
                  count: 5,
                  timed: false,
                  masteryCheck: true,
                  skillId,
                  title: `Mastery check: ${skill.domain}`,
                })
              }
            >
              <GraduationCap className="size-4" /> Start mastery check
            </Button>
          </Panel>
        </div>
        {skill.exam !== m.exam && (
          <p className="text-xs text-muted-foreground">
            Switch your active exam to {skill.exam} to practice this skill.
          </p>
        )}

        <Panel title="6 · Next steps">
          <p className="flex gap-2.5 text-sm text-navy">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            {lesson.nextSteps}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!completed && (
              <Button onClick={complete} disabled={saving}>
                <CheckCircle2 className="size-4" /> Mark lesson complete
              </Button>
            )}
            {nextSkill && (
              <Button variant="outline" asChild>
                <Link to="/lessons/$skillId" params={{ skillId: nextSkill.id }} search={{}}>
                  Next: {nextSkill.domain} <ChevronRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
