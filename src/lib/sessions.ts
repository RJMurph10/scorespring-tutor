import { supabase } from "@/integrations/supabase/client";
import type { Json, TablesInsert } from "@/integrations/supabase/types";
import type { Attempt, Question, Session, Skill } from "@/lib/data";
import {
  FULL_TEST_STRUCTURE,
  sectionsFor,
  secondsPerQuestion,
  type Exam,
} from "@/lib/domain/exams";
import { selectAdaptive } from "@/lib/domain/adaptive";
import { groupOf } from "@/lib/question-bank/build";
import type { SkillStat } from "@/lib/domain/mastery";

export type SectionPlan = {
  label: string;
  section: string;
  questionIds: string[];
  /** null = untimed */
  seconds: number | null;
  breakAfterSec?: number;
};

export type SessionConfig = {
  showFeedback: boolean;
  allowHints: boolean;
  askConfidence: boolean;
  sections: SectionPlan[];
  taskId?: string;
  skillId?: string;
  unofficial?: boolean;
  description?: string;
};

export type AnswerState = {
  selected: number | null;
  timeMs: number;
  flagged: boolean;
  usedHint: boolean;
  confidence: number | null;
  submitted: boolean;
};

export type SessionState = {
  sectionIdx: number;
  index: number;
  answers: Record<string, AnswerState>;
  remaining: Record<string, number>;
  onBreak?: boolean;
  /** sections already submitted in a timed test */
  lockedSections?: number[];
};

export type SessionResults = {
  total: number;
  correct: number;
  answered: number;
  avgTimeMs: number;
  bySection: Record<string, { correct: number; total: number }>;
  bySkill: Record<string, { correct: number; total: number }>;
};

export function parseConfig(s: Session): SessionConfig {
  const c = (s.config ?? {}) as Partial<SessionConfig>;
  return {
    showFeedback: c.showFeedback ?? s.mode === "learning",
    allowHints: c.allowHints ?? s.mode === "learning",
    askConfidence: c.askConfidence ?? false,
    sections: c.sections ?? [
      { label: s.title, section: "Mixed", questionIds: s.question_ids, seconds: null },
    ],
    ...(c.taskId ? { taskId: c.taskId } : {}),
    ...(c.skillId ? { skillId: c.skillId } : {}),
    ...(c.unofficial ? { unofficial: c.unofficial } : {}),
    ...(c.description ? { description: c.description } : {}),
  };
}

export function parseState(s: Session, cfg: SessionConfig): SessionState {
  const st = (s.state ?? {}) as Partial<SessionState>;
  const remaining: Record<string, number> = { ...(st.remaining ?? {}) };
  cfg.sections.forEach((sec, i) => {
    if (sec.seconds != null && remaining[String(i)] == null) remaining[String(i)] = sec.seconds;
  });
  return {
    sectionIdx: st.sectionIdx ?? 0,
    index: st.index ?? 0,
    answers: st.answers ?? {},
    remaining,
    onBreak: st.onBreak ?? false,
    lockedSections: st.lockedSections ?? [],
  };
}

export function emptyAnswer(): AnswerState {
  return {
    selected: null,
    timeMs: 0,
    flagged: false,
    usedHint: false,
    confidence: null,
    submitted: false,
  };
}

export function choicesOf(q: Question): string[] {
  return Array.isArray(q.choices) ? (q.choices as unknown[]).map(String) : [];
}

export function distractorNote(q: Question, idx: number): string | null {
  const notes = (q.distractor_notes ?? {}) as Record<string, unknown>;
  const v = notes[String(idx)];
  return typeof v === "string" ? v : null;
}

async function insertSession(row: TablesInsert<"sessions">) {
  const res = await supabase.from("sessions").insert(row).select("*").single();
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function recentQuestionIds(attempts: Attempt[], n = 30) {
  return new Set(attempts.slice(-n).map((a) => a.question_id));
}

export type PracticeOptions = {
  uid: string;
  exam: Exam;
  pool: Question[];
  attempts: Attempt[];
  stats: Map<string, SkillStat>;
  count: number;
  timed: boolean;
  skillId?: string | undefined;
  section?: string | undefined;
  difficulty?: number | undefined;
  weakOnly?: boolean | undefined;
  includeScience?: boolean;
  taskId?: string | undefined;
  title?: string;
  /** reattempt mode: draw only from these question ids */
  onlyIds?: string[] | undefined;
  /** untimed, no hints, feedback only at the end */
  masteryCheck?: boolean | undefined;
};

export async function startPractice(o: PracticeOptions): Promise<Session> {
  let pool = o.pool.filter((q) => q.exam === o.exam);
  if (o.includeScience === false) pool = pool.filter((q) => q.section !== "Science");
  if (o.onlyIds) pool = pool.filter((q) => o.onlyIds!.includes(q.id));
  if (o.skillId) pool = pool.filter((q) => q.skill_id === o.skillId);
  if (o.section) pool = pool.filter((q) => q.section === o.section);
  if (o.difficulty) {
    const exact = pool.filter((q) => q.difficulty === o.difficulty);
    if (exact.length > 0) pool = exact;
  }
  if (pool.length === 0) throw new Error("No questions match those filters yet.");
  const count = Math.min(o.count, pool.length);
  const ids = selectAdaptive(
    pool.map((q) => ({
      id: q.id,
      skill_id: q.skill_id,
      difficulty: q.difficulty,
      section: q.section,
    })),
    { count, stats: o.stats, recentlySeen: recentQuestionIds(o.attempts), weakOnly: !!o.weakOnly },
  );
  const perQ = Math.round(pool.reduce((s, q) => s + q.est_seconds, 0) / pool.length);
  const config: SessionConfig = {
    showFeedback: !o.timed && !o.masteryCheck,
    allowHints: !o.timed && !o.masteryCheck,
    askConfidence: false,
    sections: [
      {
        label: o.title ?? "Practice",
        section: o.section ?? "Mixed",
        questionIds: ids,
        seconds: o.timed ? perQ * ids.length : null,
      },
    ],
    ...(o.taskId ? { taskId: o.taskId } : {}),
    ...(o.skillId ? { skillId: o.skillId } : {}),
  };
  return insertSession({
    user_id: o.uid,
    kind: "practice",
    exam: o.exam,
    mode: o.timed ? "timed" : o.masteryCheck ? "simulation" : "learning",
    title: o.title ?? `${o.exam} practice · ${ids.length} questions`,
    config: config as unknown as Json,
    question_ids: ids,
  });
}

/** Two questions per skill at spread-out difficulties, grouped by section. Untimed, feedback at the end. */
export async function startDiagnostic(o: {
  uid: string;
  exam: Exam;
  pool: Question[];
  skills: Skill[];
  includeScience: boolean;
  taskId?: string | undefined;
}) {
  const sections = sectionsFor(o.exam, o.includeScience);
  const plans: SectionPlan[] = sections.map((section) => {
    const ids: string[] = [];
    for (const sk of o.skills.filter((s) => s.exam === o.exam && s.section === section)) {
      const qs = o.pool
        .filter((q) => q.skill_id === sk.id && q.generation_method !== "ai_generated")
        .sort((a, b) => a.difficulty - b.difficulty);
      if (qs.length === 0) continue;
      const picks = qs.length >= 3 ? [qs[0]!, qs[qs.length - 1]!] : qs.slice(0, 2);
      // Occasionally sample the middle difficulty so repeat diagnostics vary.
      if (qs.length >= 3 && Math.random() < 0.5) picks[Math.random() < 0.5 ? 0 : 1] = qs[1]!;
      ids.push(...picks.map((q) => q.id));
    }
    return { label: section, section, questionIds: ids, seconds: null };
  });
  const all = plans.flatMap((p) => p.questionIds);
  if (all.length === 0) throw new Error("No diagnostic questions are available for this exam.");
  const config: SessionConfig = {
    showFeedback: false,
    allowHints: false,
    askConfidence: true,
    sections: plans.filter((p) => p.questionIds.length > 0),
    ...(o.taskId ? { taskId: o.taskId } : {}),
    description:
      "Informal diagnostic — results estimate your starting point, not an official score.",
  };
  return insertSession({
    user_id: o.uid,
    kind: "diagnostic",
    exam: o.exam,
    mode: "simulation",
    title: `${o.exam} diagnostic`,
    config: config as unknown as Json,
    question_ids: all,
  });
}

/** Unofficial practice test following the real section order; timing scaled to the questions available. */
export async function startPracticeTest(o: {
  uid: string;
  exam: Exam;
  pool: Question[];
  includeScience: boolean;
  sectionsOnly?: string[] | undefined;
  taskId?: string | undefined;
}) {
  let specs = FULL_TEST_STRUCTURE[o.exam].filter(
    (s) => o.includeScience || s.section !== "Science",
  );
  if (o.sectionsOnly?.length) specs = specs.filter((s) => o.sectionsOnly!.includes(s.section));
  const bySection = new Map<string, Question[]>();
  for (const q of o.pool.filter((q) => q.exam === o.exam)) {
    const arr = bySection.get(q.section) ?? [];
    arr.push(q);
    bySection.set(q.section, arr);
  }
  const used = new Set<string>();
  const plans: SectionPlan[] = specs.map((spec) => {
    const siblings = specs.filter((s) => s.section === spec.section);
    const all = bySection.get(spec.section) ?? [];
    const target = Math.min(spec.questions, Math.max(1, Math.floor(all.length / siblings.length)));
    const units = testUnits(all.filter((q) => !used.has(q.id)));
    // Later modules (SAT module 2) lean harder, loosely mirroring the adaptive second module.
    const isLater = siblings.indexOf(spec) > 0;
    // Whole passage sets are placed first so a section isn't left short by a set that won't fit.
    const ordered = isLater
      ? [...units].sort((a, b) => avgDifficulty(b) - avgDifficulty(a))
      : [
          ...shuffle(units.filter((u) => u.length > 1)),
          ...shuffle(units.filter((u) => u.length === 1)),
        ];
    const picked: Question[][] = [];
    let count = 0;
    for (const unit of ordered) {
      if (count + unit.length > target) continue;
      picked.push(unit);
      count += unit.length;
      if (count === target) break;
    }
    picked.flat().forEach((q) => used.add(q.id));
    const ids = arrangeSection(o.exam, spec.section, picked).map((q) => q.id);
    const plan: SectionPlan = {
      label: spec.label,
      section: spec.section,
      questionIds: ids,
      seconds: secondsPerQuestion(spec) * ids.length,
    };
    if (spec.breakAfterMinutes) plan.breakAfterSec = spec.breakAfterMinutes * 60;
    return plan;
  });
  const usable = plans.filter((p) => p.questionIds.length > 0);
  if (usable.length === 0) throw new Error("Not enough questions to build a test yet.");
  const config: SessionConfig = {
    showFeedback: false,
    allowHints: false,
    askConfidence: false,
    sections: usable,
    unofficial: true,
    ...(o.taskId ? { taskId: o.taskId } : {}),
    description: `Unofficial ${o.exam} practice test — original questions, not an official College Board or ACT exam.`,
  };
  return insertSession({
    user_id: o.uid,
    kind: "test",
    exam: o.exam,
    mode: "simulation",
    title: `Unofficial ${o.exam} ${o.sectionsOnly?.length === 1 ? o.sectionsOnly[0] + " section" : "practice test"}`,
    config: config as unknown as Json,
    question_ids: usable.flatMap((p) => p.questionIds),
  });
}

/** Questions that must stay together: a shared-passage set, or a single standalone question. */
function testUnits(list: Question[]): Question[][] {
  const groups = new Map<number, Question[]>();
  const singles: Question[][] = [];
  for (const q of list) {
    const g = groupOf(q.id);
    if (g === 0) singles.push([q]);
    else groups.set(g, [...(groups.get(g) ?? []), q]);
  }
  const sets = [...groups.values()].map((qs) => [...qs].sort((a, b) => a.id.localeCompare(b.id)));
  return [...sets, ...singles];
}

function avgDifficulty(unit: Question[]) {
  return unit.reduce((s, q) => s + q.difficulty, 0) / unit.length;
}

// Digital SAT Reading and Writing modules run in this domain order.
const SAT_RW_ORDER = [
  "sat-craft-structure",
  "sat-info-ideas",
  "sat-conventions",
  "sat-expression-ideas",
];

/** Order a section the way the real test does. */
function arrangeSection(exam: Exam, section: string, units: Question[][]): Question[] {
  const flat = units.flat();
  if (exam === "SAT" && section === "Reading and Writing")
    return [...flat].sort(
      (a, b) =>
        SAT_RW_ORDER.indexOf(a.skill_id) - SAT_RW_ORDER.indexOf(b.skill_id) ||
        a.difficulty - b.difficulty,
    );
  // Math sections generally get harder as they go.
  if (section === "Math") return [...flat].sort((a, b) => a.difficulty - b.difficulty);
  // Passage-based sections: whole passages in order (Passage I, II, …), standalone questions after.
  const sets = units
    .filter((u) => u.length > 1)
    .sort((a, b) => groupOf(a[0]!.id) - groupOf(b[0]!.id));
  const singles = units.filter((u) => u.length === 1).flat();
  return [...sets.flat(), ...singles];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function computeResults(
  questions: Question[],
  answers: Record<string, AnswerState>,
): SessionResults {
  const r: SessionResults = {
    total: questions.length,
    correct: 0,
    answered: 0,
    avgTimeMs: 0,
    bySection: {},
    bySkill: {},
  };
  let time = 0;
  for (const q of questions) {
    const a = answers[q.id];
    const ok = a?.selected != null && a.selected === q.correct_index;
    if (a?.selected != null) r.answered++;
    if (ok) r.correct++;
    time += a?.timeMs ?? 0;
    const sec = (r.bySection[q.section] ??= { correct: 0, total: 0 });
    sec.total++;
    if (ok) sec.correct++;
    const sk = (r.bySkill[q.skill_id] ??= { correct: 0, total: 0 });
    sk.total++;
    if (ok) sk.correct++;
  }
  r.avgTimeMs = questions.length ? Math.round(time / questions.length) : 0;
  return r;
}

export function attemptRow(
  uid: string,
  session: Session,
  q: Question,
  a: AnswerState | undefined,
): TablesInsert<"question_attempts"> {
  const selected = a?.selected ?? null;
  return {
    user_id: uid,
    session_id: session.id,
    question_id: q.id,
    kind: session.kind,
    exam: q.exam,
    section: q.section,
    skill_id: q.skill_id,
    difficulty: q.difficulty,
    selected_index: selected,
    correct_index: q.correct_index,
    is_correct: selected != null && selected === q.correct_index,
    time_ms: Math.max(0, Math.round(a?.timeMs ?? 0)),
    confidence: a?.confidence ?? null,
    used_hint: a?.usedHint ?? false,
  };
}
