import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Play, Stethoscope, Target, Timer, Zap } from "lucide-react";
import { useState } from "react";

import { ErrorState, fmtDate, LoadingState, PageHeader, Panel, pct } from "@/components/app/common";
import { NumberChips } from "@/components/app/profile-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuestionsForExam, useSessions, useStudentModel } from "@/lib/data";
import { LEVEL_LABEL } from "@/lib/domain/mastery";
import { useLaunchers } from "@/lib/launch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/practice")({
  head: () => ({ meta: [{ title: "Practice — ScoreSpring" }] }),
  component: Practice,
});

function Practice() {
  const m = useStudentModel();
  const L = useLaunchers();
  const sessions = useSessions();
  const questions = useQuestionsForExam(m.profile ? m.exam : undefined);
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [scope, setScope] = useState<string>("mixed");
  const [difficulty, setDifficulty] = useState<string>("adaptive");

  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;

  const sections = Array.from(new Set(m.examSkills.map((s) => s.section)));
  const inProgress = (sessions.data ?? []).filter(
    (s) => s.status === "in_progress" && s.exam === m.exam,
  );
  const missedIds = Array.from(
    new Set(
      m.examAttempts
        .filter((a) => !a.is_correct)
        .map((a) => a.question_id)
        .reverse(),
    ),
  ).slice(0, 20);
  const poolSize = (questions.data ?? []).filter((q) =>
    scope.startsWith("sec:")
      ? q.section === scope.slice(4)
      : scope.startsWith("skill:")
        ? q.skill_id === scope.slice(6)
        : true,
  ).length;

  function start() {
    L.practice({
      count,
      timed,
      section: scope.startsWith("sec:") ? scope.slice(4) : undefined,
      skillId: scope.startsWith("skill:") ? scope.slice(6) : undefined,
      difficulty: difficulty === "adaptive" ? undefined : Number(difficulty),
      title: `${timed ? "Timed" : "Learning"} practice · ${scope === "mixed" ? "mixed topics" : scope.startsWith("sec:") ? scope.slice(4) : (m.skills.find((s) => s.id === scope.slice(6))?.domain ?? "skill")}`,
    });
  }

  return (
    <div>
      <PageHeader
        title="Practice"
        description={`Adaptive ${m.exam} practice: weak skills come first, difficulty follows your mastery, and strong skills get periodic review.`}
      />

      {inProgress.length > 0 && (
        <Panel title="Pick up where you left off" className="mb-6">
          <ul className="divide-y">
            {inProgress.slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy">{s.title}</p>
                  <p className="text-xs text-muted-foreground">Started {fmtDate(s.started_at)}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/session/$id" params={{ id: s.id }}>
                    <Play className="size-3.5" /> Resume
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Build a practice set">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Questions</p>
              <NumberChips value={count} onChange={setCount} options={[5, 10, 20]} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Mode</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  {
                    v: false,
                    icon: Target,
                    t: "Learning",
                    d: "Untimed. Hints, instant feedback and explanations.",
                  },
                  {
                    v: true,
                    icon: Timer,
                    t: "Timed",
                    d: "Test pace. Explanations after you finish.",
                  },
                ].map((o) => (
                  <button
                    key={o.t}
                    onClick={() => setTimed(o.v)}
                    aria-pressed={timed === o.v}
                    className={cn(
                      "rounded-xl border p-3 text-left",
                      timed === o.v
                        ? "border-primary bg-accent ring-1 ring-primary"
                        : "hover:border-primary/40",
                    )}
                  >
                    <o.icon className="size-4 text-primary" />
                    <p className="mt-1.5 text-sm font-semibold text-navy">{o.t}</p>
                    <p className="text-xs text-muted-foreground">{o.d}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-navy">Topic</p>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed topics (adaptive)</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s} value={`sec:${s}`}>
                        {s} — all skills
                      </SelectItem>
                    ))}
                    {m.examSkills.map((s) => (
                      <SelectItem key={s.id} value={`skill:${s.id}`}>
                        {s.section}: {s.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-navy">Difficulty</p>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adaptive">Adaptive</SelectItem>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {poolSize > 0 && poolSize < count && (
              <p className="text-xs text-muted-foreground">
                {poolSize} question{poolSize === 1 ? "" : "s"} match this topic right now, so the
                set will be shorter. Missed questions offer AI-generated similar questions to extend
                practice.
              </p>
            )}
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={start}
              disabled={L.busy || poolSize === 0}
            >
              <Play className="size-4" /> Start practice
            </Button>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <Zap className="size-5 text-primary" />
            <h3 className="mt-2 font-semibold text-navy">Weak-skill training</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {m.hasDiagnostic && m.weakest[0]
                ? `Focus: ${m.weakest[0].skill.name}${m.weakest[0].stat ? ` (${LEVEL_LABEL[m.weakest[0].stat.level]}, ${pct(m.weakest[0].stat.mastery)})` : ""}.`
                : "Take the diagnostic first so we know which skill to target."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  L.practice({
                    count: 10,
                    timed: false,
                    weakOnly: true,
                    title: "Weak-skill training",
                  })
                }
                disabled={L.busy || !m.hasDiagnostic}
              >
                Train weak skills
              </Button>
            </div>
          </Panel>
          <Panel>
            <Stethoscope className="size-5 text-primary" />
            <h3 className="mt-2 font-semibold text-navy">{m.exam} diagnostic</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Samples every skill at mixed difficulty. Produces an informal estimate, not an
              official score.{m.hasDiagnostic ? " Retake it any time to recheck." : ""}
            </p>
            <Button size="sm" className="mt-3" onClick={() => L.diagnostic()} disabled={L.busy}>
              {m.hasDiagnostic ? "Retake diagnostic" : "Start diagnostic"}
            </Button>
          </Panel>
          <Panel>
            <History className="size-5 text-primary" />
            <h3 className="mt-2 font-semibold text-navy">Review missed questions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {missedIds.length > 0
                ? `${missedIds.length} recently missed question${missedIds.length === 1 ? "" : "s"} to reattempt.`
                : "Questions you miss will collect here."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={L.busy || missedIds.length === 0}
              onClick={() =>
                L.practice({
                  count: missedIds.length,
                  timed: false,
                  onlyIds: missedIds,
                  title: "Missed-question review",
                })
              }
            >
              Reattempt missed
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
