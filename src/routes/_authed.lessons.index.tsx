import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2 } from "lucide-react";

import { ErrorState, levelTone, LoadingState, Meter, PageHeader } from "@/components/app/common";
import { useStudentModel } from "@/lib/data";
import { LEVEL_LABEL } from "@/lib/domain/mastery";

export const Route = createFileRoute("/_authed/lessons/")({
  head: () => ({ meta: [{ title: "Lessons — ScoreSpring" }] }),
  component: Lessons,
});

function Lessons() {
  const m = useStudentModel();
  if (m.isLoading) return <LoadingState />;
  if (m.error) return <ErrorState error={m.error} />;
  const sections = Array.from(new Set(m.examSkills.map((s) => s.section)));

  return (
    <div>
      <PageHeader
        title="Lessons"
        description={`The ${m.exam} learning library, organized by section and skill. Lesson completion and demonstrated mastery are tracked separately — mastery only comes from answering questions.`}
      />
      <div className="space-y-8">
        {sections.map((sec) => (
          <section key={sec}>
            <h2 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {sec}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {m.examSkills
                .filter((s) => s.section === sec)
                .map((s) => {
                  const st = m.stats.get(s.id);
                  const done = m.completedLessons.has(s.id);
                  return (
                    <Link
                      key={s.id}
                      to="/lessons/$skillId"
                      params={{ skillId: s.id }}
                      search={{}}
                      className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-navy group-hover:text-primary">
                            {s.domain}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{s.name}</p>
                        </div>
                        {done ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                            <CheckCircle2 className="size-3.5" /> Completed
                          </span>
                        ) : (
                          <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-[11px] font-medium text-muted-foreground">
                          <span>Mastery</span>
                          <span>{st ? LEVEL_LABEL[st.level] : "Not started"}</span>
                        </div>
                        <Meter
                          value={st?.mastery ?? 0}
                          tone={st ? levelTone(st.level) : "primary"}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
        {m.exam === "ACT" && m.profile?.act_include_writing && (
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold text-navy">ACT Writing (optional)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Writing prep happens with the AI tutor: get a prompt, outline a position, and receive
              feedback on structure, reasoning and conventions.
            </p>
            <Link
              to="/tutor"
              search={{
                q: "I'm preparing for the optional ACT Writing test. Give me an original practice prompt with three perspectives, then help me plan an essay step by step.",
              }}
              className="mt-3 inline-block text-sm font-semibold text-primary"
            >
              Start a Writing session →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
