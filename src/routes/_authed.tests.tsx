import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, ClipboardList, Clock, Coffee, Info, PenLine, Play } from "lucide-react";

import {
  EmptyState,
  ErrorState,
  fmtDate,
  LoadingState,
  PageHeader,
  Panel,
} from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { useQuestionsForExam, useSessions, useStudentModel, type Session } from "@/lib/data";
import { isDemo } from "@/lib/demo";
import { FULL_TEST_STRUCTURE, SECTION_INFO, type Exam } from "@/lib/domain/exams";
import { useLaunchers } from "@/lib/launch";
import { parseConfig, type SessionResults } from "@/lib/sessions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/tests")({
  head: () => ({ meta: [{ title: "Practice Tests — ScoreSpring" }] }),
  component: Tests,
});

function fmtMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}

/** The student's most recent completed result for a section, from any practice test. */
function lastSectionResult(tests: Session[], section: string) {
  for (const s of tests) {
    const r = s.results as SessionResults | null;
    const sec = r?.bySection?.[section];
    if (s.status === "completed" && sec) return { ...sec, date: s.completed_at ?? s.started_at };
  }
  return null;
}

function Tests() {
  const m = useStudentModel();
  const L = useLaunchers();
  const sessions = useSessions();
  const questions = useQuestionsForExam(m.profile ? m.exam : undefined);
  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;

  const exam: Exam = m.exam;
  const includeScience = m.profile?.act_include_science ?? true;
  const allSpecs = FULL_TEST_STRUCTURE[exam];
  const fullSpecs = allSpecs.filter((s) => includeScience || s.section !== "Science");
  const tests = (sessions.data ?? []).filter((s) => s.kind === "test" && s.exam === exam);
  const inProgress = tests.filter((s) => s.status === "in_progress");
  const done = tests.filter((s) => s.status === "completed");
  const available = (sec: string) => (questions.data ?? []).filter((q) => q.section === sec).length;
  const fullMinutes = fullSpecs.reduce((s, x) => s + x.minutes, 0);
  const fullQuestions = fullSpecs.reduce((s, x) => s + x.questions, 0);

  return (
    <div>
      <PageHeader
        title="Practice tests"
        description={`Take the full ${exam} or one section at a time, in the official order and with real timing.`}
      />

      <div className="mb-6 flex gap-3 rounded-xl border bg-accent/50 p-4 text-sm text-navy">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          {exam === "SAT"
            ? "The digital SAT has two sections — Reading and Writing, then Math — each split into two modules, with a 10-minute break in between. "
            : "The enhanced ACT runs English, Math, Reading, then the optional Science section. Your composite score averages English, Math and Reading. "}
          These are <strong>unofficial practice tests</strong> built from ScoreSpring's original
          questions, not official College Board or ACT exams.
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

      <h2 className="mb-3 text-lg font-bold text-navy">Sections</h2>
      <div
        className={cn(
          "grid gap-4",
          exam === "SAT" ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {SECTION_INFO[exam].map((info, idx) => {
          const specs = allSpecs.filter((s) => s.section === info.section);
          const minutes = specs.reduce((s, x) => s + x.minutes, 0);
          const count = specs.reduce((s, x) => s + x.questions, 0);
          const last = lastSectionResult(done, info.section);
          const off = info.section === "Science" && !includeScience;
          return (
            <div key={info.section} className="flex flex-col rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Section {idx + 1}</p>
                  <h3 className="text-lg font-bold text-navy">{info.name}</h3>
                </div>
                {info.optional && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    Optional
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap gap-x-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> {minutes} min
                </span>
                <span>{count} questions</span>
                {specs.length > 1 && <span>{specs.length} modules</span>}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{info.summary}</p>
              {info.calculator && (
                <p className="mt-2 flex gap-1.5 text-xs text-navy">
                  <Calculator className="mt-0.5 size-3.5 shrink-0 text-primary" /> {info.calculator}
                </p>
              )}
              {info.optional && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {info.optional}
                  {off && " It's turned off in your Settings, so it's left out of full tests."}
                </p>
              )}
              <div className="mt-auto pt-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  {last ? (
                    <>
                      Your last result:{" "}
                      <strong className="tabular text-navy">
                        {last.correct}/{last.total}
                      </strong>{" "}
                      · {fmtDate(last.date)}
                    </>
                  ) : (
                    "You haven't taken this section yet."
                  )}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={L.busy || available(info.section) === 0}
                  onClick={() => L.practiceTest([info.section])}
                >
                  Start {info.name} section
                </Button>
              </div>
            </div>
          );
        })}
        {exam === "ACT" && (
          <div className="flex flex-col rounded-2xl border border-dashed bg-card/60 p-5 md:col-span-2 xl:col-span-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="flex items-center gap-2 font-bold text-navy">
                <PenLine className="size-4 text-primary" /> Writing (optional essay)
              </h3>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                Optional · 40 min
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              One essay that weighs perspectives on an issue. Practice it with the AI tutor, which
              gives you a prompt and feedback on your plan and draft.
              {isDemo() && " The tutor needs a free account."}
            </p>
            <div className="mt-3">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/tutor"
                  search={{
                    q: "I'm preparing for the optional ACT Writing test. Give me an original practice prompt with three perspectives, then help me plan an essay step by step.",
                  }}
                >
                  Practice Writing with the tutor
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <Panel
        className="mt-6"
        title={`Full ${exam} practice test`}
        description={`${fullQuestions} questions · ${fmtMinutes(fullMinutes)} of testing, plus breaks`}
      >
        <ol className="grid gap-2 sm:grid-cols-2">
          {fullSpecs.map((s, i) => (
            <li
              key={s.label}
              className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg border px-3 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2 text-navy">
                <span className="tabular flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold">
                  {i + 1}
                </span>
                {s.label}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                {s.questions} q · {s.minutes} min
                {s.breakAfterMinutes && (
                  <span className="flex items-center gap-1">
                    <Coffee className="size-3.5" /> then {s.breakAfterMinutes}-min break
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
        <Button className="mt-4" size="lg" onClick={() => L.practiceTest()} disabled={L.busy}>
          <ClipboardList className="size-4" /> Start full test
        </Button>
      </Panel>

      <h2 className="mt-8 mb-3 text-lg font-bold text-navy">Your results</h2>
      {done.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-5" />} title="No practice tests yet">
          After you finish a section or full test, your scores by section and every answer
          explanation will appear here.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Test</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">By section</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {done.map((s) => {
                const r = s.results as SessionResults | null;
                const order = parseConfig(s).sections.map((x) => x.section);
                const secs = Object.entries(r?.bySection ?? {}).sort(
                  (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
                );
                return (
                  <tr key={s.id} className="border-t align-top">
                    <td className="px-4 py-3">
                      <Link
                        to="/session/$id"
                        params={{ id: s.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {fmtDate(s.completed_at ?? s.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {secs.map(([name, v]) => (
                          <span
                            key={name}
                            className="tabular rounded-md bg-muted px-2 py-0.5 text-xs text-navy"
                          >
                            {name} {v.correct}/{v.total}
                          </span>
                        ))}
                      </div>
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
