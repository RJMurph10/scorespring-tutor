export type AttemptLite = {
  skill_id: string;
  section: string;
  exam: string;
  difficulty: number;
  is_correct: boolean;
  time_ms: number;
  created_at: string;
  used_hint?: boolean;
};

export type SkillStat = {
  skillId: string;
  attempts: number;
  correct: number;
  accuracy: number; // raw 0..1
  mastery: number; // 0..1 smoothed, difficulty-weighted, recency-weighted
  level: MasteryLevel;
  avgTimeMs: number;
  lastAttemptAt: string | null;
};

export type MasteryLevel = "not_started" | "learning" | "developing" | "proficient" | "mastered";

/** Minimum attempts before a skill can be called mastered. Lesson completion never counts. */
export const MASTERY_MIN_ATTEMPTS = 6;

export function levelFor(mastery: number, attempts: number): MasteryLevel {
  if (attempts === 0) return "not_started";
  if (mastery >= 0.85 && attempts >= MASTERY_MIN_ATTEMPTS) return "mastered";
  if (mastery >= 0.7) return "proficient";
  if (mastery >= 0.45) return "developing";
  return "learning";
}

/**
 * Mastery = Beta-smoothed weighted accuracy. Harder questions weigh more, recent attempts weigh more,
 * hinted correct answers count as partial credit. Starts at a neutral prior of 0.5 with 2 pseudo-attempts.
 */
export function computeSkillStats(attempts: AttemptLite[]): Map<string, SkillStat> {
  const bySkill = new Map<string, AttemptLite[]>();
  for (const a of attempts) {
    const arr = bySkill.get(a.skill_id) ?? [];
    arr.push(a);
    bySkill.set(a.skill_id, arr);
  }
  const out = new Map<string, SkillStat>();
  for (const [skillId, list] of bySkill) {
    const sorted = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    let wSum = 2;
    let wCorrect = 1;
    sorted.forEach((a, i) => {
      const recency = 0.6 + 0.4 * ((i + 1) / sorted.length);
      const diffW = 0.75 + 0.25 * a.difficulty;
      const w = recency * diffW;
      const credit = a.is_correct ? (a.used_hint ? 0.5 : 1) : 0;
      wSum += w;
      wCorrect += w * credit;
    });
    const correct = sorted.filter((a) => a.is_correct).length;
    const mastery = wCorrect / wSum;
    out.set(skillId, {
      skillId,
      attempts: sorted.length,
      correct,
      accuracy: correct / sorted.length,
      mastery,
      level: levelFor(mastery, sorted.length),
      avgTimeMs: sorted.reduce((s, a) => s + a.time_ms, 0) / sorted.length,
      lastAttemptAt: sorted[sorted.length - 1]?.created_at ?? null,
    });
  }
  return out;
}

export const LEVEL_LABEL: Record<MasteryLevel, string> = {
  not_started: "Not started",
  learning: "Needs work",
  developing: "Developing",
  proficient: "Proficient",
  mastered: "Mastered",
};
