import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarCheck, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  ErrorState,
  fmtDate,
  LoadingState,
  PageHeader,
  Panel,
  pct,
} from "@/components/app/common";
import { TaskRow } from "@/components/app/task-row";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { regeneratePlan, useStudentModel, useUserId } from "@/lib/data";
import { daysUntil, nextDate, toISODate } from "@/lib/domain/plan";
import { useLaunchers } from "@/lib/launch";

export const Route = createFileRoute("/_authed/plan")({
  head: () => ({ meta: [{ title: "Study Plan — ScoreSpring" }] }),
  component: Plan,
});

function Plan() {
  const uid = useUserId();
  const m = useStudentModel();
  const L = useLaunchers();
  const qc = useQueryClient();
  const [working, setWorking] = useState(false);

  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;
  const p = m.profile!;
  const today = toISODate(new Date());
  const tasks = m.tasks.filter((t) => t.exam === m.exam);
  const missed = tasks.filter((t) => t.status === "pending" && t.scheduled_date < today);
  const upcoming = tasks.filter((t) => t.scheduled_date >= today);
  const byDate = new Map<string, typeof upcoming>();
  for (const t of upcoming)
    byDate.set(t.scheduled_date, [...(byDate.get(t.scheduled_date) ?? []), t]);
  const weekMinutes = upcoming.reduce((s, t) => s + t.minutes, 0);
  const doneThisWeek = tasks.filter(
    (t) =>
      t.status === "done" &&
      t.completed_at &&
      Date.now() - new Date(t.completed_at).getTime() < 7 * 86400000,
  ).length;
  const untilTest = daysUntil(p.test_date, new Date());
  const crunch = untilTest != null && untilTest >= 0 && untilTest <= 14;
  const priorities = m.weakest.slice(0, crunch ? 2 : 4);

  async function recalc() {
    if (!uid) return;
    setWorking(true);
    try {
      await regeneratePlan({
        uid,
        profile: p,
        skills: m.skills,
        attempts: m.all,
        completedLessons: m.completedLessons,
      });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Plan recalculated from your latest results");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update the plan");
    } finally {
      setWorking(false);
    }
  }

  async function reschedule(ids: string[]) {
    setWorking(true);
    // Move each missed task to the next day, spreading them so no single day overflows.
    let cursor = today;
    const perDay = new Map<string, number>();
    for (const t of upcoming)
      perDay.set(t.scheduled_date, (perDay.get(t.scheduled_date) ?? 0) + t.minutes);
    for (const id of ids) {
      const t = tasks.find((x) => x.id === id)!;
      let d = nextDate(cursor, new Date());
      d = d < today ? today : d;
      // first try today if there is room
      const candidates = [today, d];
      let target =
        candidates.find((c) => (perDay.get(c) ?? 0) + t.minutes <= p.minutes_per_day) ?? d;
      while (
        (perDay.get(target) ?? 0) + t.minutes > p.minutes_per_day &&
        target < toISODate(new Date(Date.now() + 21 * 86400000))
      ) {
        target = nextDate(target, new Date());
      }
      perDay.set(target, (perDay.get(target) ?? 0) + t.minutes);
      cursor = target;
      const { error } = await supabase
        .from("study_tasks")
        .update({ scheduled_date: target })
        .eq("id", id);
      if (error) toast.error(error.message);
    }
    await qc.invalidateQueries({ queryKey: ["tasks"] });
    setWorking(false);
    toast.success(ids.length > 1 ? `${ids.length} tasks rescheduled` : "Task rescheduled");
  }

  async function skip(id: string) {
    await supabase.from("study_tasks").update({ status: "skipped" }).eq("id", id);
    await qc.invalidateQueries({ queryKey: ["tasks"] });
  }

  return (
    <div>
      <PageHeader
        title="Study plan"
        description="Built from your diagnostic results, target, test date and available time. It recalculates as new results come in."
        actions={
          <Button variant="outline" onClick={recalc} disabled={working}>
            {working ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}{" "}
            Recalculate
          </Button>
        }
      />

      {crunch && (
        <div className="mb-6 flex gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-navy">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Your test is in <strong>{untilTest} days</strong>. The plan now skips new lessons and
            focuses on your two highest-value skills with timed drills — the most realistic gains in
            the time left.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {missed.length > 0 && (
            <Panel
              title={`Missed (${missed.length})`}
              description="Move these to your next study days without losing the rest of the plan."
              action={
                <Button
                  size="sm"
                  onClick={() => reschedule(missed.map((t) => t.id))}
                  disabled={working}
                >
                  Reschedule all
                </Button>
              }
            >
              <div className="space-y-2">
                {missed.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    missed
                    busy={working || L.busy}
                    onReschedule={() => reschedule([t.id])}
                    onStart={() => L.launchTask(t)}
                  />
                ))}
              </div>
            </Panel>
          )}

          {byDate.size === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="size-5" />}
              title="No upcoming tasks"
              action={
                <Button onClick={recalc} disabled={working}>
                  Build this week's plan
                </Button>
              }
            >
              {untilTest != null && untilTest < 0
                ? "Your test date has passed — update it in Settings to keep planning."
                : "Generate a fresh week of tasks from your current results."}
            </EmptyState>
          ) : (
            Array.from(byDate.entries()).map(([date, list]) => (
              <section key={date}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-sm font-bold text-navy">
                    {date === today
                      ? "Today"
                      : fmtDate(date, { weekday: "long", month: "short", day: "numeric" })}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {list.reduce((s, t) => s + t.minutes, 0)} min
                  </span>
                </div>
                <div className="space-y-2">
                  {list.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      busy={L.busy}
                      onStart={() => L.launchTask(t)}
                      onDone={() => L.markTaskDone(t.id)}
                    />
                  ))}
                  {list.some((t) => t.status === "pending") && date === today && (
                    <button
                      className="text-xs font-medium text-muted-foreground hover:text-navy"
                      onClick={() =>
                        list.filter((t) => t.status === "pending").forEach((t) => skip(t.id))
                      }
                    >
                      Skip today's remaining tasks
                    </button>
                  )}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Panel title="This week">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Planned</dt>
                <dd className="tabular font-semibold text-navy">{weekMinutes} min</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Your budget</dt>
                <dd className="tabular font-semibold text-navy">
                  {p.minutes_per_day} min × {p.days_per_week} days
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tasks done (7 days)</dt>
                <dd className="tabular font-semibold text-navy">{doneThisWeek}</dd>
              </div>
            </dl>
            <Link to="/settings" className="mt-3 inline-block text-xs font-semibold text-primary">
              Change schedule
            </Link>
          </Panel>
          <Panel
            title="Priority skills"
            description={
              m.hasDiagnostic
                ? "Lowest mastery first — they get the most time."
                : "Take the diagnostic to rank these from real data."
            }
          >
            <ol className="space-y-2.5">
              {priorities.map(({ skill, stat }, i) => (
                <li key={skill.id} className="flex items-start gap-2.5 text-sm">
                  <span className="tabular mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-accent text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-medium text-navy">{skill.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {skill.section} · {stat ? `mastery ${pct(stat.mastery)}` : "not yet measured"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
