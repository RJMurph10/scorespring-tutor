import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";

import {
  EmptyState,
  ErrorState,
  fmtDate,
  levelTone,
  LoadingState,
  Meter,
  Panel,
  pct,
} from "@/components/app/common";
import { TaskRow } from "@/components/app/task-row";
import { Button } from "@/components/ui/button";
import { useSessions, useStudentModel } from "@/lib/data";
import { SCORE_RANGE } from "@/lib/domain/exams";
import { LEVEL_LABEL } from "@/lib/domain/mastery";
import { daysUntil, toISODate } from "@/lib/domain/plan";
import { MIN_ATTEMPTS_PER_SECTION } from "@/lib/domain/scoring";
import { useLaunchers } from "@/lib/launch";
import type { SessionResults } from "@/lib/sessions";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ScoreSpring" }] }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const m = useStudentModel();
  const sessions = useSessions();
  const L = useLaunchers();

  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;
  const p = m.profile!;
  const today = toISODate(new Date());
  const todays = m.tasks.filter((t) => t.scheduled_date === today && t.exam === m.exam);
  const nextTask = m.tasks.find(
    (t) => t.status === "pending" && t.scheduled_date >= today && t.exam === m.exam,
  );
  const countdown = daysUntil(p.test_date, new Date());
  const isNew = m.examAttempts.length === 0;
  const est = m.estimate;
  const completed = (sessions.data ?? [])
    .filter((s) => s.status === "completed" && s.exam === m.exam)
    .slice(0, 5);
  const todaysMinutes = todays.reduce((s, t) => s + t.minutes, 0);
  const sections = Array.from(new Set(m.examSkills.map((s) => s.section)));

  const recommendation = !m.hasDiagnostic
    ? `Start with the ${m.exam} diagnostic (about 20 minutes) so your plan targets real gaps instead of guesses.`
    : nextTask
      ? `Next up: ${nextTask.title.toLowerCase()} — about ${nextTask.minutes} minutes.`
      : "You're caught up. Practice your weakest skill or ask the tutor about something that's been tricky.";

  function continueLearning() {
    if (!m.hasDiagnostic) return L.diagnostic();
    if (nextTask) return L.launchTask(nextTask);
    return L.practice({ count: 10, timed: false, title: "Mixed practice" });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 md:p-7">
        <p className="text-sm font-medium text-muted-foreground">
          {greeting()}
          {p.display_name ? `, ${p.display_name}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy md:text-[28px]">
          {todays.length > 0
            ? `Today's plan: ${todays.length} task${todays.length > 1 ? "s" : ""}, ~${todaysMinutes} min`
            : "Ready when you are"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{recommendation}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="lg" onClick={continueLearning} disabled={L.busy}>
            Continue learning <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={L.practiceWeakest}
            disabled={L.busy || !m.hasDiagnostic}
          >
            <Target className="size-4" /> Practice weakest skill
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/tutor">
              <Sparkles className="size-4" /> Ask your AI tutor
            </Link>
          </Button>
        </div>
      </section>

      {isNew && (
        <Panel
          title="Getting started"
          description="Your dashboard fills in with real numbers as you practice — nothing here is estimated until there's data."
        >
          <ol className="space-y-3">
            {[
              { done: true, label: "Set your goal and schedule", to: "/settings" },
              {
                done: m.hasDiagnostic,
                label: `Take the ${m.exam} diagnostic`,
                action: () => L.diagnostic(),
              },
              {
                done: m.completedLessons.size > 0,
                label: "Finish your first lesson",
                to: "/lessons",
              },
              { done: false, label: "Ask the tutor a question", to: "/tutor" },
            ].map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-sm">
                {s.done ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
                {s.done ? (
                  <span className="text-muted-foreground line-through">{s.label}</span>
                ) : s.action ? (
                  <button
                    className="font-semibold text-primary hover:underline"
                    onClick={s.action}
                    disabled={L.busy}
                  >
                    {s.label}
                  </button>
                ) : (
                  <Link to={s.to!} className="font-semibold text-primary hover:underline">
                    {s.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Estimated {m.exam} range
          </p>
          {est.ready ? (
            <>
              <p className="tabular mt-2 text-3xl font-extrabold text-navy">
                {est.low}–{est.high}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Informal estimate from {est.basedOn} answers. Not an official score.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-bold text-navy">Not enough data yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Needs {MIN_ATTEMPTS_PER_SECTION} answers per section. Still to go:{" "}
                {Object.entries(est.needed)
                  .map(([s, n]) => `${s} ${n}`)
                  .join(", ")}
                .
              </p>
            </>
          )}
          {p.current_score != null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Self-reported practice score: <strong className="text-navy">{p.current_score}</strong>
            </p>
          )}
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Target
          </p>
          {p.target_score ? (
            <>
              <p className="tabular mt-2 text-3xl font-extrabold text-navy">{p.target_score}</p>
              {(() => {
                const r = SCORE_RANGE[m.exam];
                const base = est.ready ? est.mid : p.current_score;
                if (base == null)
                  return (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Progress appears once we have a starting point.
                    </p>
                  );
                const prog = (base - r.min) / Math.max(1, p.target_score - r.min);
                const gap = p.target_score - base;
                return (
                  <>
                    <Meter value={prog} className="mt-3" tone={gap <= 0 ? "success" : "primary"} />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {gap <= 0 ? "At or above target" : `${gap} points to go`} (
                      {est.ready ? "from estimate" : "self-reported"})
                    </p>
                  </>
                );
              })()}
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              <Link to="/settings" className="font-semibold text-primary">
                Set a target score
              </Link>
            </p>
          )}
        </Panel>

        <Panel className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Streak
              </p>
              <p className="tabular mt-2 text-3xl font-extrabold text-navy">
                {m.streak}{" "}
                <span className="text-base font-semibold text-muted-foreground">
                  day{m.streak === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            <Flame
              className={
                m.streak > 0 ? "size-5 text-[oklch(0.68_0.18_45)]" : "size-5 text-muted-foreground"
              }
            />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> {m.weekMinutes} min studied in the last 7 days
            {p.minutes_per_day && ` · goal ${p.minutes_per_day * p.days_per_week}`}
          </p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Test day
              </p>
              {countdown != null && countdown >= 0 ? (
                <p className="tabular mt-2 text-3xl font-extrabold text-navy">
                  {countdown}{" "}
                  <span className="text-base font-semibold text-muted-foreground">days</span>
                </p>
              ) : (
                <p className="mt-2 text-lg font-bold text-navy">
                  {countdown != null ? "Date passed" : "Not set"}
                </p>
              )}
            </div>
            <CalendarDays className="size-5 text-primary" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {p.test_date ? (
              fmtDate(p.test_date, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            ) : (
              <Link to="/settings" className="font-semibold text-primary">
                Add your test date
              </Link>
            )}
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Skill mastery"
          description="Mastery comes from answered questions — finishing a lesson alone doesn't count."
          action={
            <Link to="/progress" className="text-xs font-semibold text-primary">
              Details
            </Link>
          }
        >
          <div className="space-y-5">
            {sections.map((sec) => (
              <div key={sec}>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {sec}
                </p>
                <div className="space-y-2.5">
                  {m.examSkills
                    .filter((s) => s.section === sec)
                    .map((s) => {
                      const st = m.stats.get(s.id);
                      return (
                        <div
                          key={s.id}
                          className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1"
                        >
                          <p className="truncate text-sm text-navy">{s.domain}</p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {st ? `${LEVEL_LABEL[st.level]} · ${pct(st.mastery)}` : "Not started"}
                          </p>
                          <Meter
                            value={st?.mastery ?? 0}
                            tone={st ? levelTone(st.level) : "primary"}
                            className="col-span-2"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Today"
            action={
              <Link to="/plan" className="text-xs font-semibold text-primary">
                Full plan
              </Link>
            }
          >
            {todays.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks scheduled today.{" "}
                {nextTask ? `Next: ${fmtDate(nextTask.scheduled_date, { weekday: "long" })}.` : ""}
              </p>
            ) : (
              <div className="space-y-2">
                {todays.map((t) => (
                  <TaskRow key={t.id} task={t} busy={L.busy} onStart={() => L.launchTask(t)} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Recent results">
            {completed.length === 0 ? (
              <EmptyState title="No completed sessions yet">
                Finished quizzes and tests will show here.
              </EmptyState>
            ) : (
              <ul className="divide-y">
                {completed.map((s) => {
                  const r = s.results as SessionResults | null;
                  return (
                    <li key={s.id}>
                      <Link
                        to="/session/$id"
                        params={{ id: s.id }}
                        className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-navy">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {fmtDate(s.completed_at ?? s.started_at)}
                          </p>
                        </div>
                        {r && (
                          <span className="tabular shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-bold text-navy">
                            {r.correct}/{r.total}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
