import { createFileRoute, Link } from "@tanstack/react-router";
import { LineChart as LineIcon, Loader2, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MessageResponse } from "@/components/ai-elements/message";
import {
  EmptyState,
  ErrorState,
  fmtDate,
  LoadingState,
  Meter,
  PageHeader,
  Panel,
  pct,
} from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { analyzeMistakes } from "@/lib/ai.functions";
import { DEMO_AI_MESSAGE, isDemo } from "@/lib/demo";
import { toLite, useSessions, useStudentModel } from "@/lib/data";
import { SCORE_RANGE } from "@/lib/domain/exams";
import { estimateScore } from "@/lib/domain/scoring";

export const Route = createFileRoute("/_authed/progress")({
  head: () => ({ meta: [{ title: "Progress — ScoreSpring" }] }),
  component: Progress,
});

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTip({
  active,
  payload,
  label,
  fmt,
}: {
  active?: boolean;
  payload?: { value: number; payload: Record<string, unknown> }[];
  label?: string;
  fmt: (p: Record<string, unknown>) => string;
}) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-navy">{label}</p>
      <p className="text-muted-foreground">{fmt(payload[0].payload)}</p>
    </div>
  );
}

function Progress() {
  const m = useStudentModel();
  const sessions = useSessions();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisErr, setAnalysisErr] = useState<string | null>(null);

  const data = useMemo(() => {
    const att = m.examAttempts;
    const skillName = (id: string) => m.skills.find((s) => s.id === id)?.domain ?? id;
    const includeScience = m.profile?.act_include_science ?? true;

    // Score history: estimate recomputed at the end of each day with activity, shown only once ready.
    const days = Array.from(new Set(att.map((a) => a.created_at.slice(0, 10)))).sort();
    const history = days
      .map((d) => {
        const upTo = att.filter((a) => a.created_at.slice(0, 10) <= d).map(toLite);
        const e = estimateScore(m.exam, upTo, includeScience);
        return e.ready ? { date: fmtDate(d), mid: e.mid, low: e.low, high: e.high } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);

    const group = <K extends string>(key: (a: (typeof att)[number]) => K) => {
      const map = new Map<K, { correct: number; total: number; time: number }>();
      for (const a of att) {
        const k = key(a);
        const g = map.get(k) ?? { correct: 0, total: 0, time: 0 };
        g.total++;
        g.time += a.time_ms;
        if (a.is_correct) g.correct++;
        map.set(k, g);
      }
      return map;
    };
    const bySection = Array.from(group((a) => a.section)).map(([section, g]) => ({
      section,
      acc: g.correct / g.total,
      total: g.total,
      avgSec: Math.round(g.time / g.total / 1000),
    }));
    const bySkill = m.examSkills
      .map((s) => {
        const list = att.filter((a) => a.skill_id === s.id);
        const correct = list.filter((a) => a.is_correct).length;
        return {
          id: s.id,
          name: s.domain,
          total: list.length,
          acc: list.length ? correct / list.length : 0,
          missed: list.length - correct,
        };
      })
      .filter((x) => x.total > 0);
    const byDiff = [1, 2, 3].map((d) => {
      const list = att.filter((a) => a.difficulty === d);
      return {
        label: ["Easy", "Medium", "Hard"][d - 1]!,
        acc: list.length ? list.filter((a) => a.is_correct).length / list.length : 0,
        total: list.length,
      };
    });
    const mostMissed = [...bySkill]
      .filter((s) => s.missed > 0)
      .sort((a, b) => b.missed - a.missed)
      .slice(0, 4);

    const trend = m.examSkills
      .map((s) => {
        const list = att.filter((a) => a.skill_id === s.id);
        if (list.length < 4) return null;
        const half = Math.floor(list.length / 2);
        const acc = (l: typeof list) => l.filter((a) => a.is_correct).length / l.length;
        return {
          id: s.id,
          name: s.domain,
          delta: acc(list.slice(half)) - acc(list.slice(0, half)),
          n: list.length,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => b.delta - a.delta);

    return { history, bySection, bySkill, byDiff, mostMissed, trend, skillName };
  }, [
    m.examAttempts,
    m.skills,
    m.examSkills,
    m.exam,
    m.profile?.act_include_science,
    m.completedLessons,
  ]);

  // Accuracy change after reviewing a topic (lesson completion date as the split point).
  const lessonEffect = useMemo(() => {
    return m.examSkills
      .map((s) => {
        const done = m.lessonDates.get(s.id);
        if (!done) return null;
        const list = m.examAttempts.filter((a) => a.skill_id === s.id);
        const before = list.filter((a) => a.created_at < done);
        const after = list.filter((a) => a.created_at >= done);
        if (before.length < 2 || after.length < 2) return null;
        const acc = (l: typeof list) => l.filter((a) => a.is_correct).length / l.length;
        return { name: s.domain, before: acc(before), after: acc(after) };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [m.examSkills, m.lessonDates, m.examAttempts]);

  if (m.isLoading || sessions.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;

  if (m.examAttempts.length === 0)
    return (
      <div>
        <PageHeader title="Progress" />
        <EmptyState
          icon={<LineIcon className="size-5" />}
          title="No practice data yet"
          action={
            <Button asChild>
              <Link to="/practice">Start practicing</Link>
            </Button>
          }
        >
          Analytics are built only from questions you've actually answered — there's nothing to show
          until you've done some practice.
        </EmptyState>
      </div>
    );

  const avgSec = Math.round(
    m.examAttempts.reduce((s, a) => s + a.time_ms, 0) / m.examAttempts.length / 1000,
  );
  const overall = m.examAttempts.filter((a) => a.is_correct).length / m.examAttempts.length;
  const improving = data.trend.filter((t) => t.delta > 0.05).slice(0, 3);
  const attention = m.weakest.filter((w) => w.stat && w.stat.mastery < 0.6).slice(0, 3);
  const slowSection = [...data.bySection].sort((a, b) => b.avgSec - a.avgSec)[0];
  const hardGap =
    data.byDiff[0]!.total >= 3 && data.byDiff[2]!.total >= 3
      ? data.byDiff[0]!.acc - data.byDiff[2]!.acc
      : null;

  const recs: string[] = [];
  if (!m.hasDiagnostic) recs.push(`Take the ${m.exam} diagnostic so every section has a baseline.`);
  if (attention[0])
    recs.push(
      `Spend your next two sessions on ${attention[0].skill.domain} — it's your lowest-mastery skill (${pct(attention[0].stat!.mastery)}). Start with the lesson, then guided practice.`,
    );
  if (data.mostMissed[0] && data.mostMissed[0].id !== attention[0]?.skill.id)
    recs.push(
      `${data.mostMissed[0].name} has your most misses (${data.mostMissed[0].missed}). Review those explanations and reattempt them from Practice.`,
    );
  if (hardGap != null && hardGap > 0.3)
    recs.push(
      "You're solid on easy questions but drop off on hard ones — add timed drills at hard difficulty for your proficient skills.",
    );
  if (slowSection && slowSection.avgSec > 90)
    recs.push(
      `${slowSection.section} averages ${slowSection.avgSec}s per question — a timed section test would help pacing.`,
    );
  if (!m.estimate.ready)
    recs.push(
      `Answer ${Object.entries(m.estimate.needed)
        .map(([s, n]) => `${n} more ${s}`)
        .join(", ")} question(s) to unlock a score range.`,
    );
  if (recs.length === 0)
    recs.push(
      "Keep the plan going — your accuracy is steady. Add a full practice test to check pacing.",
    );

  async function runAnalysis() {
    setAnalyzing(true);
    setAnalysisErr(null);
    if (isDemo()) {
      setAnalysisErr(DEMO_AI_MESSAGE);
      setAnalyzing(false);
      return;
    }
    try {
      const r = await analyzeMistakes();
      setAnalysis(r.markdown);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setAnalysisErr(
        msg.includes("not configured")
          ? "AI analysis isn't available right now. The recommendations above still apply."
          : msg,
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const range = SCORE_RANGE[m.exam];

  return (
    <div>
      <PageHeader
        title="Progress"
        description={`Based on ${m.examAttempts.length} answered ${m.exam} questions. Projections are informal estimates, not guarantees or official scores.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Panel className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Overall accuracy</p>
          <p className="tabular mt-1 text-3xl font-extrabold text-navy">{pct(overall)}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Avg. time per question
          </p>
          <p className="tabular mt-1 text-3xl font-extrabold text-navy">{avgSec}s</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Estimated range</p>
          <p className="tabular mt-1 text-3xl font-extrabold text-navy">
            {m.estimate.ready ? `${m.estimate.low}–${m.estimate.high}` : "—"}
          </p>
          {!m.estimate.ready && (
            <p className="text-xs text-muted-foreground">Needs more answers per section</p>
          )}
        </Panel>
      </div>

      <Panel
        title="What to do next"
        className="mb-6"
        action={
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}{" "}
            Analyze my mistakes
          </Button>
        }
      >
        <ul className="space-y-2">
          {recs.map((r) => (
            <li key={r} className="flex gap-2.5 text-sm text-navy">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {r}
            </li>
          ))}
        </ul>
        {analysisErr && <p className="mt-3 text-sm text-destructive">{analysisErr}</p>}
        {analysis && (
          <div className="mt-4 rounded-xl bg-accent/50 p-4 text-sm text-navy">
            <p className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase">
              AI analysis of your recent mistakes
            </p>
            <MessageResponse>{analysis}</MessageResponse>
          </div>
        )}
      </Panel>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel
          title="Estimated score over time"
          description="Shown once every section has enough answers."
        >
          {data.history.length < 2 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {data.history.length === 1
                ? "One data point so far — keep practicing on different days to see a trend."
                : "Not enough data for a score estimate yet."}
            </p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={data.history} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis domain={[range.min, range.max]} {...axisProps} />
                  <Tooltip
                    content={
                      <ChartTip
                        fmt={(p) => `Estimate ${p["mid"]} (range ${p["low"]}–${p["high"]})`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="mid"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="By section">
          <div className="space-y-4">
            {data.bySection.map((s) => (
              <div key={s.section}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-navy">{s.section}</span>
                  <span className="tabular text-muted-foreground">
                    <strong className="text-navy">{pct(s.acc)}</strong> · {s.total} answered ·{" "}
                    {s.avgSec}s avg
                  </span>
                </div>
                <Meter value={s.acc} tone={s.acc >= 0.7 ? "success" : "primary"} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Accuracy by skill">
          <div style={{ height: Math.max(160, data.bySkill.length * 34) }}>
            <ResponsiveContainer>
              <BarChart
                data={data.bySkill}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                barSize={14}
              >
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v: number) => pct(v)}
                  {...axisProps}
                />
                <YAxis type="category" dataKey="name" width={150} {...axisProps} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={
                    <ChartTip fmt={(p) => `${pct(p["acc"] as number)} correct of ${p["total"]}`} />
                  }
                />
                <Bar dataKey="acc" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Accuracy by difficulty">
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart
                data={data.byDiff}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                barSize={40}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis domain={[0, 1]} tickFormatter={(v: number) => pct(v)} {...axisProps} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={
                    <ChartTip fmt={(p) => `${pct(p["acc"] as number)} correct of ${p["total"]}`} />
                  }
                />
                <Bar dataKey="acc" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Most-missed concepts">
          {data.mostMissed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No misses yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.mostMissed.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <Link
                    to="/lessons/$skillId"
                    params={{ skillId: s.id }}
                    search={{}}
                    className="text-navy hover:text-primary"
                  >
                    {s.name}
                  </Link>
                  <span className="tabular text-muted-foreground">{s.missed} missed</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Momentum"
          description="Accuracy in your recent half of attempts vs. your earlier half (skills with 4+ answers)."
        >
          {data.trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Answer at least 4 questions in a skill to see its trend.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-success">
                  <TrendingUp className="size-3.5" /> Improving fastest
                </p>
                {improving.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing clearly rising yet.</p>
                ) : (
                  improving.map((t) => (
                    <p key={t.id} className="text-sm text-navy">
                      {t.name}{" "}
                      <span className="tabular text-success">+{Math.round(t.delta * 100)} pts</span>
                    </p>
                  ))
                )}
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <TrendingDown className="size-3.5" /> Needs attention
                </p>
                {attention.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skill below 60% mastery.</p>
                ) : (
                  attention.map((w) => (
                    <p key={w.skill.id} className="text-sm text-navy">
                      {w.skill.domain}{" "}
                      <span className="tabular text-muted-foreground">{pct(w.stat!.mastery)}</span>
                    </p>
                  ))
                )}
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="After reviewing a lesson"
          description="Accuracy before vs. after you completed the lesson (needs 2+ answers on each side)."
        >
          {lessonEffect.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete a lesson from your plan, then practice that skill to see the change.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lessonEffect.map((l) => (
                <li key={l.name} className="flex justify-between">
                  <span className="text-navy">{l.name}</span>
                  <span className="tabular text-muted-foreground">
                    {pct(l.before)} →{" "}
                    <strong className={l.after >= l.before ? "text-success" : "text-destructive"}>
                      {pct(l.after)}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
