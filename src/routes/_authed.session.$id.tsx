import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  Flag,
  Lightbulb,
  Loader2,
  LogOut,
  MessageCircleQuestion,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingState, Meter, Panel, pct } from "@/components/app/common";
import { ChoiceList, Passage } from "@/components/app/question";
import { SimilarQuestion } from "@/components/app/similar-question";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  fetchQuestionsByIds,
  markTaskDone,
  regeneratePlan,
  useSessionById,
  useStudentModel,
  useUserId,
  type Question,
  type Session,
} from "@/lib/data";
import { LESSONS } from "@/lib/domain/lessons";
import { useLaunchers } from "@/lib/launch";
import {
  attemptRow,
  choicesOf,
  computeResults,
  distractorNote,
  emptyAnswer,
  parseConfig,
  parseState,
  type AnswerState,
  type SessionConfig,
  type SessionResults,
  type SessionState,
} from "@/lib/sessions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/session/$id")({
  head: () => ({ meta: [{ title: "Session — ScoreSpring" }] }),
  component: SessionPage,
});

function SessionPage() {
  const { id } = Route.useParams();
  const sess = useSessionById(id);
  const questions = useQuery({
    queryKey: ["session-questions", id],
    enabled: !!sess.data,
    staleTime: Infinity,
    queryFn: () => fetchQuestionsByIds(sess.data!.question_ids),
  });
  if (sess.isLoading || questions.isLoading) return <LoadingState label="Loading session…" />;
  if (sess.error || questions.error) return <ErrorState error={sess.error ?? questions.error} />;
  const s = sess.data!;
  const qs = questions.data ?? [];
  if (s.status === "completed") return <Results session={s} questions={qs} />;
  return <Runner session={s} questions={qs} onDone={() => sess.refetch()} />;
}

/* ================================================================ runner */

function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function hintFor(q: Question) {
  const lesson = LESSONS[q.skill_id];
  const firstStep = q.explanation.split(/(?<=[.!?])\s/)[0] ?? "";
  // Point toward the method without giving the answer away.
  if (lesson?.mistakes[0])
    return `Think about the key idea: ${lesson.concept.split(/(?<=[.])\s/)[0]} Watch out for this trap: ${lesson.mistakes[0]}`;
  return `Start here: ${firstStep.replace(/\d+(\.\d+)?/g, "…")}`;
}

function Runner({
  session,
  questions,
  onDone,
}: {
  session: Session;
  questions: Question[];
  onDone: () => void;
}) {
  const uid = useUserId();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const model = useStudentModel();
  const cfg = useMemo(() => parseConfig(session), [session]);
  const qMap = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const [state, setState] = useState<SessionState>(() => parseState(session, cfg));
  const [showHint, setShowHint] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [breakLeft, setBreakLeft] = useState<number | null>(null);
  const shownAt = useRef(Date.now());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const section = cfg.sections[state.sectionIdx]!;
  const sectionQs = section.questionIds.filter((id) => qMap.has(id));
  const qid = sectionQs[Math.min(state.index, sectionQs.length - 1)]!;
  const q = qMap.get(qid)!;
  const ans: AnswerState = state.answers[qid] ?? emptyAnswer();
  const learning = cfg.showFeedback;
  const remaining =
    section.seconds != null ? (state.remaining[String(state.sectionIdx)] ?? section.seconds) : null;
  const totalQs = cfg.sections.reduce((s, sec) => s + sec.questionIds.length, 0);
  const answeredCount = Object.values(state.answers).filter((a) => a.selected != null).length;

  const persist = useCallback(
    (st: SessionState, immediate = false) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const run = () =>
        supabase
          .from("sessions")
          .update({ state: st as unknown as Json })
          .eq("id", session.id)
          .then();
      if (immediate) return void run();
      saveTimer.current = setTimeout(run, 700);
    },
    [session.id],
  );

  const update = useCallback(
    (fn: (s: SessionState) => SessionState, immediate = false) => {
      setState((prev) => {
        const next = fn(prev);
        persist(next, immediate);
        return next;
      });
    },
    [persist],
  );

  /** Adds time spent on the current question since it was shown. */
  const withTime = useCallback(
    (s: SessionState): SessionState => {
      const a = s.answers[qid] ?? emptyAnswer();
      if (learning && a.submitted) {
        shownAt.current = Date.now();
        return s;
      }
      const elapsed = Date.now() - shownAt.current;
      shownAt.current = Date.now();
      return { ...s, answers: { ...s.answers, [qid]: { ...a, timeMs: a.timeMs + elapsed } } };
    },
    [qid, learning],
  );

  useEffect(() => {
    shownAt.current = Date.now();
    setShowHint(false);
  }, [qid]);

  const setAnswer = (patch: Partial<AnswerState>) =>
    update((s) => ({
      ...s,
      answers: { ...s.answers, [qid]: { ...(s.answers[qid] ?? emptyAnswer()), ...patch } },
    }));

  const goTo = (sectionIdx: number, index: number) =>
    update((s) => ({ ...withTime(s), sectionIdx, index }));

  async function finish(finalState: SessionState) {
    if (!uid || finishing) return;
    setFinishing(true);
    try {
      const all = cfg.sections
        .flatMap((sec) => sec.questionIds)
        .map((id) => qMap.get(id))
        .filter((x): x is Question => !!x);
      if (!learning) {
        const rows = all.map((qq) => attemptRow(uid, session, qq, finalState.answers[qq.id]));
        const ins = await supabase.from("question_attempts").insert(rows);
        if (ins.error) throw new Error(ins.error.message);
      }
      const results = computeResults(all, finalState.answers);
      const up = await supabase
        .from("sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          results: results as unknown as Json,
          state: finalState as unknown as Json,
        })
        .eq("id", session.id);
      if (up.error) throw new Error(up.error.message);
      await markTaskDone(cfg.taskId);
      if (session.kind !== "practice" && model.profile) {
        // New diagnostic or test data → recalculate the plan.
        const att = await supabase
          .from("question_attempts")
          .select("*")
          .eq("user_id", uid)
          .order("created_at")
          .limit(5000);
        await regeneratePlan({
          uid,
          profile: model.profile,
          skills: model.skills,
          attempts: att.data ?? [],
          completedLessons: model.completedLessons,
        });
      }
      await Promise.all(
        ["attempts", "sessions", "tasks"].map((k) => qc.invalidateQueries({ queryKey: [k] })),
      );
      await qc.invalidateQueries({ queryKey: ["session", session.id] });
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your results");
      setFinishing(false);
    }
  }

  async function submitLearning() {
    if (!uid || ans.selected == null || ans.submitted) return;
    const next = withTime(state);
    const a = { ...(next.answers[qid] ?? emptyAnswer()), submitted: true };
    const st = { ...next, answers: { ...next.answers, [qid]: a } };
    setState(st);
    persist(st, true);
    const res = await supabase.from("question_attempts").insert(attemptRow(uid, session, q, a));
    if (res.error) toast.error("Couldn't save this answer: " + res.error.message);
  }

  function nextLearning() {
    if (state.index < sectionQs.length - 1) return goTo(state.sectionIdx, state.index + 1);
    if (state.sectionIdx < cfg.sections.length - 1) return goTo(state.sectionIdx + 1, 0);
    finish(state);
  }

  function submitSection(auto = false) {
    setConfirmOpen(false);
    const st = withTime(state);
    const locked = [...(st.lockedSections ?? []), st.sectionIdx];
    const last = st.sectionIdx >= cfg.sections.length - 1;
    if (auto) toast.info("Time's up for this section.");
    if (last) {
      const final = { ...st, lockedSections: locked };
      setState(final);
      void finish(final);
      return;
    }
    const brk = section.breakAfterSec;
    const next: SessionState = {
      ...st,
      lockedSections: locked,
      sectionIdx: st.sectionIdx + 1,
      index: 0,
      onBreak: !!brk,
    };
    setState(next);
    persist(next, true);
    if (brk) setBreakLeft(brk);
  }

  // Section timer
  useEffect(() => {
    if (remaining == null || state.onBreak || finishing) return;
    const t = setInterval(() => {
      setState((prev) => {
        const key = String(prev.sectionIdx);
        const left = (prev.remaining[key] ?? 0) - 1;
        const next = { ...prev, remaining: { ...prev.remaining, [key]: left } };
        if (left % 15 === 0) persist(next, true);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [remaining == null, state.onBreak, state.sectionIdx, finishing, persist]);

  useEffect(() => {
    if (remaining != null && remaining <= 0 && !finishing && !state.onBreak) submitSection(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // Break countdown
  useEffect(() => {
    if (!state.onBreak) return;
    if (breakLeft == null) setBreakLeft(section.breakAfterSec ?? 600);
    const t = setInterval(() => setBreakLeft((b) => (b == null ? b : b - 1)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.onBreak]);

  const endBreak = useCallback(() => {
    setBreakLeft(null);
    update((s) => ({ ...s, onBreak: false }), true);
  }, [update]);
  useEffect(() => {
    if (breakLeft != null && breakLeft <= 0) endBreak();
  }, [breakLeft, endBreak]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || confirmOpen || state.onBreak || finishing)
        return;
      const n = choicesOf(q).length;
      const k = e.key.toLowerCase();
      const idx = "abcde".indexOf(k) >= 0 ? "abcde".indexOf(k) : "12345".indexOf(k);
      if (idx >= 0 && idx < n && !(learning && ans.submitted)) {
        setAnswer({ selected: idx });
        e.preventDefault();
      } else if (k === "enter" && learning) {
        e.preventDefault();
        if (ans.submitted) nextLearning();
        else submitLearning();
      } else if (k === "f" && !learning) {
        setAnswer({ flagged: !ans.flagged });
      } else if (k === "arrowright" && !learning && state.index < sectionQs.length - 1) {
        goTo(state.sectionIdx, state.index + 1);
      } else if (k === "arrowleft" && !learning && state.index > 0) {
        goTo(state.sectionIdx, state.index - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function saveAndExit() {
    const st = withTime(state);
    persist(st, true);
    toast.success("Progress saved. Resume any time.");
    navigate({ to: session.kind === "test" ? "/tests" : "/dashboard" });
  }

  if (finishing)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" /> Scoring your answers…
      </div>
    );

  if (state.onBreak)
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <Coffee className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 text-2xl font-bold text-navy">Break time</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stand up, stretch, drink some water. The next section starts automatically.
        </p>
        <p className="tabular mt-6 text-5xl font-extrabold text-navy">{fmtClock(breakLeft ?? 0)}</p>
        <Button className="mt-8" onClick={endBreak}>
          Skip break — start {cfg.sections[state.sectionIdx]?.label}
        </Button>
      </div>
    );

  if (!q) return <ErrorState error="This session has no questions available." />;

  const isCorrect = ans.selected === q.correct_index;
  const posInAll =
    cfg.sections.slice(0, state.sectionIdx).reduce((s, sec) => s + sec.questionIds.length, 0) +
    state.index +
    1;
  const lowTime = remaining != null && remaining <= 60;
  // Long passages (ACT Reading/Science/English) sit beside the question on wide screens, like the real test.
  const split = (q.passage?.length ?? 0) > 700;

  return (
    <div className={cn("mx-auto", split ? "max-w-6xl" : "max-w-3xl")}>
      {/* top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {session.exam} · {section.label}
            {cfg.unofficial && " · Unofficial practice"}
          </p>
          <p className="truncate text-sm font-semibold text-navy">{session.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {remaining != null && (
            <span
              className={cn(
                "tabular flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold",
                lowTime ? "border-destructive/40 text-destructive" : "text-navy",
              )}
              aria-live={lowTime ? "polite" : "off"}
            >
              <Clock className="size-4" /> {fmtClock(remaining)}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={saveAndExit}>
            <LogOut className="size-4" /> Save & exit
          </Button>
        </div>
      </div>
      <Meter
        value={
          (learning ? posInAll - (ans.submitted ? 0 : 1) : answeredCount) / Math.max(1, totalQs)
        }
        className="mb-6"
      />

      <div className="rounded-2xl border bg-card p-5 md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">
            Question {state.index + 1} <span className="font-normal">of {sectionQs.length}</span>
          </p>
          {!learning && (
            <Button
              variant={ans.flagged ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setAnswer({ flagged: !ans.flagged })}
              aria-pressed={ans.flagged}
            >
              <Flag className={cn("size-4", ans.flagged && "fill-warning text-warning")} />{" "}
              {ans.flagged ? "Flagged" : "Flag for review"}
            </Button>
          )}
        </div>

        <div className={cn(split && "lg:grid lg:grid-cols-2 lg:items-start lg:gap-8")}>
          {q.passage && (
            <div className={cn("mb-4", split && "lg:sticky lg:top-20 lg:mb-0")}>
              <Passage text={q.passage} scroll={split} />
            </div>
          )}
          <div>
            <p className="mb-5 text-[16px] leading-relaxed font-medium whitespace-pre-line text-navy">
              {q.prompt}
            </p>
            <ChoiceList
              question={q}
              selected={ans.selected}
              onSelect={(i) => !(learning && ans.submitted) && setAnswer({ selected: i })}
              reveal={learning && ans.submitted}
              disabled={learning && ans.submitted}
            />

            {cfg.askConfidence && ans.selected != null && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">How sure are you?</span>
                {[
                  [1, "Guessing"],
                  [2, "Somewhat"],
                  [3, "Sure"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setAnswer({ confidence: v as number })}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-semibold",
                      ans.confidence === v
                        ? "border-primary bg-accent text-primary"
                        : "text-muted-foreground hover:border-primary/40",
                    )}
                    aria-pressed={ans.confidence === v}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            {learning && !ans.submitted && showHint && (
              <div className="mt-4 rounded-xl bg-warning-soft p-4 text-sm text-navy">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Lightbulb className="size-4" /> Hint
                </p>
                <p className="mt-1">{hintFor(q)}</p>
              </div>
            )}

            {learning && ans.submitted && (
              <div
                className={cn(
                  "mt-5 rounded-xl p-4 text-sm",
                  isCorrect ? "bg-success-soft" : "bg-destructive/5",
                )}
                aria-live="polite"
              >
                <p
                  className={cn(
                    "flex items-center gap-1.5 font-semibold",
                    isCorrect ? "text-success" : "text-destructive",
                  )}
                >
                  {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  {isCorrect
                    ? ans.usedHint
                      ? "Correct (with a hint)"
                      : "Correct"
                    : `Not quite — the answer is ${"ABCDE"[q.correct_index]}`}
                </p>
                {!isCorrect && ans.selected != null && distractorNote(q, ans.selected) && (
                  <p className="mt-2 text-navy">
                    <strong>Why {"ABCDE"[ans.selected]} is tempting:</strong>{" "}
                    {distractorNote(q, ans.selected)}
                  </p>
                )}
                <p className="mt-2 text-navy">{q.explanation}</p>
                {Object.entries((q.distractor_notes ?? {}) as Record<string, string>)
                  .filter(([k]) => Number(k) !== ans.selected && Number(k) !== q.correct_index)
                  .slice(0, 1)
                  .map(([k, v]) => (
                    <p key={k} className="mt-2 text-muted-foreground">
                      Also tempting, {"ABCDE"[Number(k)]}: {v}
                    </p>
                  ))}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tutor" search={{ q: tutorPrompt(q, ans.selected) }}>
                      <MessageCircleQuestion className="size-4" /> Ask the tutor
                    </Link>
                  </Button>
                  {!isCorrect && <SimilarQuestion sourceId={q.id} />}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              {learning ? (
                <>
                  <div>
                    {cfg.allowHints && !ans.submitted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowHint(true);
                          setAnswer({ usedHint: true });
                        }}
                        disabled={showHint}
                      >
                        <Lightbulb className="size-4" /> Hint
                      </Button>
                    )}
                  </div>
                  {!ans.submitted ? (
                    <Button onClick={submitLearning} disabled={ans.selected == null}>
                      Check answer
                    </Button>
                  ) : (
                    <Button onClick={nextLearning}>
                      {posInAll >= totalQs ? "See results" : "Next question"}{" "}
                      <ArrowRight className="size-4" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => goTo(state.sectionIdx, state.index - 1)}
                    disabled={state.index === 0}
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  {state.index < sectionQs.length - 1 ? (
                    <Button onClick={() => goTo(state.sectionIdx, state.index + 1)}>
                      Next <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => setConfirmOpen(true)}>
                      {state.sectionIdx < cfg.sections.length - 1 ? "Submit section" : "Finish"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!learning && (
        <div className="mt-4 rounded-2xl border bg-card p-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Questions in this section
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sectionQs.map((id, i) => {
              const a = state.answers[id];
              return (
                <button
                  key={id}
                  onClick={() => goTo(state.sectionIdx, i)}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-lg border text-sm font-semibold",
                    i === state.index ? "border-primary ring-1 ring-primary" : "",
                    a?.selected != null ? "bg-accent text-primary" : "text-muted-foreground",
                  )}
                  aria-label={`Question ${i + 1}${a?.selected != null ? ", answered" : ""}${a?.flagged ? ", flagged" : ""}`}
                >
                  {i + 1}
                  {a?.flagged && (
                    <Flag className="absolute -top-1.5 -right-1.5 size-3.5 fill-warning text-warning" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Keys: A–D to answer · ← → to move · F to flag
          </p>
        </div>
      )}
      {learning && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Keys: A–D to answer · Enter to check / continue
        </p>
      )}
      {cfg.description && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">{cfg.description}</p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {state.sectionIdx < cfg.sections.length - 1
                ? `Submit ${section.label}?`
                : "Finish and see results?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const unanswered = sectionQs.filter(
                  (id) => state.answers[id]?.selected == null,
                ).length;
                const flagged = sectionQs.filter((id) => state.answers[id]?.flagged).length;
                return `${unanswered} unanswered, ${flagged} flagged. You can't return to this section after submitting.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep working</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitSection()}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function tutorPrompt(q: Question, selected: number | null) {
  const choices = choicesOf(q);
  return [
    `I'm working on this ${q.exam} ${q.section} question:`,
    q.passage ? `Passage: ${q.passage}` : "",
    `Question: ${q.prompt}`,
    `Choices: ${choices.map((c, i) => `${"ABCD"[i]}) ${c}`).join("  ")}`,
    selected != null
      ? `I chose ${"ABCD"[selected]} and the answer is ${"ABCD"[q.correct_index]}. Why was my answer wrong, and how should I think about questions like this?`
      : "Can you help me understand how to solve it?",
  ]
    .filter(Boolean)
    .join("\n");
}

/* =============================================================== results */

function Results({ session, questions }: { session: Session; questions: Question[] }) {
  const cfg: SessionConfig = parseConfig(session);
  const st = parseState(session, cfg);
  const r = (session.results as SessionResults | null) ?? computeResults(questions, st.answers);
  const model = useStudentModel();
  const L = useLaunchers();
  const skillName = (id: string) => model.skills.find((s) => s.id === id)?.name ?? id;
  const missed = questions.filter((q) => st.answers[q.id]?.selected !== q.correct_index);
  const missedSkills = Object.entries(r.bySkill)
    .filter(([, v]) => v.correct < v.total)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
  const [filter, setFilter] = useState<"all" | "missed">(missed.length ? "missed" : "all");
  const shown = filter === "missed" ? missed : questions;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {session.exam} ·{" "}
          {session.kind === "diagnostic"
            ? "Diagnostic"
            : session.kind === "test"
              ? "Unofficial practice test"
              : "Practice"}{" "}
          results
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{session.title}</h1>
        {cfg.description && <p className="mt-1 text-sm text-muted-foreground">{cfg.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Score</p>
          <p className="tabular mt-1 text-3xl font-extrabold text-navy">
            {r.correct}/{r.total}
          </p>
          <p className="text-xs text-muted-foreground">
            {pct(r.correct / Math.max(1, r.total))} correct
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Avg. time / question
          </p>
          <p className="tabular mt-1 text-3xl font-extrabold text-navy">
            {Math.round(r.avgTimeMs / 1000)}s
          </p>
          <p className="text-xs text-muted-foreground">
            {r.answered} of {r.total} answered
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Estimated {session.exam} range
          </p>
          {model.estimate.ready ? (
            <>
              <p className="tabular mt-1 text-3xl font-extrabold text-navy">
                {model.estimate.low}–{model.estimate.high}
              </p>
              <p className="text-xs text-muted-foreground">
                Informal, from all your practice — not an official score.
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              More answers needed in: {Object.keys(model.estimate.needed).join(", ")}.
            </p>
          )}
        </Panel>
      </div>

      <Panel title="By section">
        <div className="space-y-3">
          {Object.entries(r.bySection).map(([sec, v]) => (
            <div key={sec}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-navy">{sec}</span>
                <span className="tabular font-semibold text-navy">
                  {v.correct}/{v.total}
                </span>
              </div>
              <Meter
                value={v.correct / Math.max(1, v.total)}
                tone={v.correct / v.total >= 0.7 ? "success" : "primary"}
              />
            </div>
          ))}
        </div>
        {missedSkills.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <p className="text-sm font-semibold text-navy">Skills to work on</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {missedSkills.slice(0, 4).map(([id, v]) => (
                <li key={id} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {skillName(id)}{" "}
                    <span className="tabular">
                      ({v.correct}/{v.total})
                    </span>
                  </span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/lessons/$skillId" params={{ skillId: id }} search={{}}>
                        Lesson
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={L.busy}
                      onClick={() =>
                        L.practice({
                          count: 5,
                          timed: false,
                          skillId: id,
                          title: `Practice: ${skillName(id)}`,
                        })
                      }
                    >
                      Practice
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {session.kind !== "practice" && (
          <p className="mt-4 rounded-lg bg-accent px-3 py-2 text-xs text-navy">
            Your study plan was recalculated with these results.
          </p>
        )}
      </Panel>

      <div className="flex flex-wrap gap-2">
        {missed.length > 0 && (
          <Button
            variant="outline"
            disabled={L.busy}
            onClick={() =>
              L.practice({
                count: missed.length,
                timed: false,
                onlyIds: missed.map((q) => q.id),
                title: "Reattempt missed questions",
              })
            }
          >
            Reattempt missed questions
          </Button>
        )}
        <Button asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Review answers</h2>
          <div className="flex rounded-lg border bg-muted/60 p-0.5 text-xs font-semibold">
            {(["missed", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1",
                  filter === f ? "bg-card text-navy shadow-sm" : "text-muted-foreground",
                )}
              >
                {f === "missed" ? `Missed (${missed.length})` : `All (${questions.length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {shown.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing missed — nice work.</p>
          )}
          {shown.map((q) => {
            const a = st.answers[q.id];
            const ok = a?.selected === q.correct_index;
            return (
              <div key={q.id} className="rounded-2xl border bg-card p-5">
                <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground">
                    {q.section} · {skillName(q.skill_id)} ·{" "}
                    {"Easy Medium Hard".split(" ")[q.difficulty - 1]}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 font-bold",
                      ok ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {ok ? "Correct" : a?.selected == null ? "Unanswered" : "Incorrect"}
                  </span>
                </div>
                {q.passage && (
                  <div className="mb-3">
                    <Passage text={q.passage} />
                  </div>
                )}
                <p className="mb-3 font-medium whitespace-pre-line text-navy">{q.prompt}</p>
                <ChoiceList question={q} selected={a?.selected ?? null} reveal disabled />
                <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm text-navy">
                  {!ok && a?.selected != null && distractorNote(q, a.selected) && (
                    <p className="mb-1.5">
                      <strong>Why {"ABCD"[a.selected]} is tempting:</strong>{" "}
                      {distractorNote(q, a.selected)}
                    </p>
                  )}
                  <p>{q.explanation}</p>
                </div>
                {!ok && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/tutor" search={{ q: tutorPrompt(q, a?.selected ?? null) }}>
                        <MessageCircleQuestion className="size-4" /> Ask the tutor
                      </Link>
                    </Button>
                    <SimilarQuestion sourceId={q.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
