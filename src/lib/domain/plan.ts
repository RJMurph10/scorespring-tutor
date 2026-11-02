import type { SkillStat } from "./mastery";

export type PlanSkill = { id: string; name: string; exam: string; section: string };
export type PlanProfile = {
  minutesPerDay: number;
  daysPerWeek: number;
  testDate: string | null; // yyyy-mm-dd
  exam: "SAT" | "ACT";
};
export type PlanTask = {
  scheduled_date: string;
  kind:
    | "lesson"
    | "guided_practice"
    | "timed_drill"
    | "review"
    | "progress_check"
    | "practice_test"
    | "diagnostic";
  skill_id: string | null;
  exam: string;
  title: string;
  objective: string;
  minutes: number;
};

export const TASK_MINUTES = {
  lesson: 10,
  guided_practice: 15,
  timed_drill: 12,
  review: 8,
  progress_check: 15,
  practice_test: 60,
  diagnostic: 20,
} as const;

export function daysUntil(dateStr: string | null, today: Date): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Which weekdays are study days: spread daysPerWeek evenly, starting today. */
export function studyDates(
  start: Date,
  days: number,
  daysPerWeek: number,
  until: number | null,
): string[] {
  const out: string[] = [];
  const pattern = Array.from({ length: daysPerWeek }, (_, k) => Math.floor((k * 7) / daysPerWeek));
  for (let i = 0; i < days; i++) {
    if (until !== null && i > until) break;
    if (!pattern.includes(i % 7)) continue;
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    out.push(toISODate(d));
  }
  return out;
}

/**
 * Builds the next 7 days of tasks. Priority skills = lowest mastery (unseen skills next).
 * If the test is close, drop lessons and focus on the highest-value skills plus timed practice.
 * Each day never exceeds the student's available minutes.
 */
export function buildWeekPlan(args: {
  profile: PlanProfile;
  skills: PlanSkill[];
  stats: Map<string, SkillStat>;
  completedLessons: Set<string>;
  hasDiagnostic: boolean;
  today: Date;
}): PlanTask[] {
  const { profile, skills, stats, completedLessons, today } = args;
  const exam = profile.exam;
  const untilTest = daysUntil(profile.testDate, today);
  const crunch = untilTest !== null && untilTest <= 14;
  const dates = studyDates(today, 7, Math.max(1, Math.min(7, profile.daysPerWeek)), untilTest);
  const budget = Math.max(10, profile.minutesPerDay);
  const examSkills = skills.filter((s) => s.exam === exam);

  const ranked = [...examSkills].sort(
    (a, b) => priority(stats.get(a.id)) - priority(stats.get(b.id)),
  );
  const priorityCount = crunch ? 2 : 4;
  const prioritySkills = ranked.slice(0, priorityCount);
  const strongSkills = examSkills.filter((s) => {
    const st = stats.get(s.id);
    return st && (st.level === "proficient" || st.level === "mastered");
  });

  const tasks: PlanTask[] = [];
  let skillCursor = 0;
  // A lesson is scheduled once per week per skill; later sessions on that skill become practice.
  const lessonPlanned = new Set<string>();
  let reviewCursor = 0;

  dates.forEach((date, dayIdx) => {
    let left = budget;
    const add = (t: Omit<PlanTask, "scheduled_date" | "exam">) => {
      if (t.minutes > left) return false;
      tasks.push({ ...t, scheduled_date: date, exam });
      left -= t.minutes;
      return true;
    };

    if (!args.hasDiagnostic && dayIdx === 0) {
      add({
        kind: "diagnostic",
        skill_id: null,
        title: `${exam} diagnostic`,
        objective: "Measure your starting point in every section so the plan can target real gaps.",
        minutes: Math.min(left, TASK_MINUTES.diagnostic),
      });
    }

    const isLastDay = dayIdx === dates.length - 1;
    if (isLastDay && dates.length >= 3) {
      if (untilTest !== null && untilTest <= 45 && budget >= 45) {
        add({
          kind: "practice_test",
          skill_id: null,
          title: `Unofficial ${exam} section test`,
          objective: "Practice pacing under timed conditions on a full section.",
          minutes: Math.min(left, TASK_MINUTES.practice_test),
        });
      } else {
        add({
          kind: "progress_check",
          skill_id: null,
          title: "Weekly progress check",
          objective: "Mixed questions across sections to measure this week's improvement.",
          minutes: TASK_MINUTES.progress_check,
        });
      }
    }

    // fill with priority skill work
    let guard = 0;
    while (left >= 8 && prioritySkills.length > 0 && guard++ < 6) {
      const s = prioritySkills[skillCursor % prioritySkills.length]!;
      skillCursor++;
      const st = stats.get(s.id);
      const needsLesson =
        !crunch &&
        !completedLessons.has(s.id) &&
        !lessonPlanned.has(s.id) &&
        (!st || st.mastery < 0.6);
      const placed = needsLesson
        ? add({
            kind: "lesson",
            skill_id: s.id,
            title: `Lesson: ${s.name}`,
            objective: `Understand the core idea and common traps in ${s.name.toLowerCase()}.`,
            minutes: TASK_MINUTES.lesson,
          })
        : crunch || (st && st.mastery >= 0.6)
          ? add({
              kind: "timed_drill",
              skill_id: s.id,
              title: `Timed drill: ${s.name}`,
              objective: `Answer accurately at test pace on ${s.name.toLowerCase()}.`,
              minutes: TASK_MINUTES.timed_drill,
            })
          : add({
              kind: "guided_practice",
              skill_id: s.id,
              title: `Guided practice: ${s.name}`,
              objective: `Work through hinted problems on ${s.name.toLowerCase()} and fix recurring mistakes.`,
              minutes: TASK_MINUTES.guided_practice,
            });
      if (!placed) break;
      if (needsLesson) lessonPlanned.add(s.id);
    }

    // spaced review of strong skills every other day
    if (strongSkills.length > 0 && dayIdx % 2 === 1 && left >= TASK_MINUTES.review) {
      const s = strongSkills[reviewCursor % strongSkills.length]!;
      reviewCursor++;
      add({
        kind: "review",
        skill_id: s.id,
        title: `Review: ${s.name}`,
        objective: `Keep ${s.name.toLowerCase()} sharp with a short spaced-review set.`,
        minutes: TASK_MINUTES.review,
      });
    }
  });
  return tasks;
}

function priority(st?: SkillStat) {
  if (!st) return 0.55; // unseen: after clearly weak, before decent
  return st.mastery;
}

/** Next study date strictly after `from` that isn't in the past. */
export function nextDate(from: string, today: Date) {
  const base = new Date(
    Math.max(
      new Date(from + "T00:00:00").getTime(),
      new Date(toISODate(today) + "T00:00:00").getTime(),
    ),
  );
  base.setDate(base.getDate() + 1);
  return toISODate(base);
}
