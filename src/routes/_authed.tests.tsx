import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Clock, Coffee, Info, Play } from "lucide-react";

import {
  EmptyState,
  ErrorState,
  fmtDate,
  LoadingState,
  PageHeader,
  Panel,
} from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { useQuestionsForExam, useSessions, useStudentModel } from "@/lib/data";
import { FULL_TEST_STRUCTURE } from "@/lib/domain/exams";
import { useLaunchers } from "@/lib/launch";
import type { SessionResults } from "@/lib/sessions";

export const Route = createFileRoute("/_authed/tests")({
  head: () => ({ meta: [{ title: "Practice Tests — ScoreSpring" }] }),
  component: Tests,
});

function Tests() {
  const m = useStudentModel();
  const L = useLaunchers();
  const sessions = useSessions();
  const questions = useQuestionsForExam(m.profile ? m.exam : undefined);
  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;

  const includeScience = m.profile?.act_include_science ?? true;
  const specs = FULL_TEST_STRUCTURE[m.exam].filter(
    (s) => includeScience || s.section !== "Science",
  );
  const tests = (sessions.data ?? []).filter((s) => s.kind === "test" && s.exam === m.exam);
  const inProgress = tests.filter((s) => s.status === "in_progress");
  const done = tests.filter((s) => s.status === "completed");
  const countBySection = (sec: string) =>
    (questions.data ?? []).filter((q) => q.section === sec).length;
  const sections = Array.from(new Set(specs.map((s) => s.section)));

  return (
    <div>
      <PageHeader
        title="Practice tests"
        description={`Timed ${m.exam} simulations that follow the real section order, with breaks, flagging and saved progress.`}
      />

      <div className="mb-6 flex gap-3 rounded-xl border bg-accent/50 p-4 text-sm text-navy">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          These are <strong>unofficial practice tests</strong> built from ScoreSpring's original
          questions — not official College Board or ACT exams. Section timing is scaled from the
          real per-question pace to the number of questions currently in the bank, so results are an
          informal estimate.
        </p>
      </div>

      {inProgress.length > 0 && (
        <Panel title="In progress" className="mb-6">
          <ul className="divide-y">
            {inProgress.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-navy">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Started{" "}
                    {fmtDate(s.started_at, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button size="sm" asChild>
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
        <Panel
          title={`Full unofficial ${m.exam} practice test`}
          description="Real section order and pacing; breaks where the real test has them."
        >
          <ol className="space-y-2">
            {specs.map((s, i) => (
              <li
                key={s.label}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 text-navy">
                  <span className="tabular flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  {s.label}
                </span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {s.minutes} min / {s.questions} q (real)
                  </span>
                  {s.breakAfterMinutes && (
                    <span className="flex items-center gap-1">
                      <Coffee className="size-3.5" /> {s.breakAfterMinutes}m break
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            Questions available now: {sections.map((s) => `${s} ${countBySection(s)}`).join(" · ")}
          </p>
          <Button className="mt-4" size="lg" onClick={() => L.practiceTest()} disabled={L.busy}>
            <ClipboardList className="size-4" /> Start full test
          </Button>
        </Panel>

        <Panel
          title="Section tests"
          description="One timed section — good for pacing practice on shorter days."
        >
          <div className="space-y-2">
            {sections.map((sec) => (
              <div
                key={sec}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                <span className="text-sm text-navy">{sec}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={L.busy || countBySection(sec) === 0}
                  onClick={() => L.practiceTest([sec])}
                >
                  Start
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-bold text-navy">Past results</h2>
      {done.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-5" />} title="No practice tests yet">
          Your scores, section breakdowns and answer explanations will appear here.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Test</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {done.map((s) => {
                const r = s.results as SessionResults | null;
                return (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3">
                      <Link
                        to="/session/$id"
                        params={{ id: s.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDate(s.completed_at ?? s.started_at)}
                    </td>
                    <td className="tabular px-4 py-3 text-right font-semibold text-navy">
                      {r ? `${r.correct}/${r.total}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
