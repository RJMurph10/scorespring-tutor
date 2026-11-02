import type { Exam } from "./exams";
import { sectionsFor } from "./exams";
import type { AttemptLite } from "./mastery";

/** Minimum answered questions per section before any estimate is shown. */
export const MIN_ATTEMPTS_PER_SECTION = 8;

export type SectionEstimate = {
  section: string;
  attempts: number;
  low: number;
  high: number;
  mid: number;
};
export type ScoreEstimate =
  | { ready: false; reason: string; needed: Record<string, number> }
  | {
      ready: true;
      exam: Exam;
      low: number;
      high: number;
      mid: number;
      sections: SectionEstimate[];
      basedOn: number;
    };

function weightedAbility(list: AttemptLite[]) {
  // difficulty-weighted accuracy with a mild prior, in 0..1
  let w = 1;
  let c = 0.5;
  for (const a of list) {
    const dw = 0.6 + 0.3 * a.difficulty;
    w += dw;
    if (a.is_correct) c += dw;
  }
  return c / w;
}

/**
 * Informal estimate only. Uncertainty shrinks with more attempts but never below a floor,
 * because short quizzes cannot produce a precise score.
 */
export function estimateScore(
  exam: Exam,
  attempts: AttemptLite[],
  includeScience = true,
): ScoreEstimate {
  // Enhanced ACT: the composite uses English, Math and Reading only. Science is optional and
  // reported separately, so it never blocks the estimate; it's added once it has enough data.
  const required = exam === "ACT" ? ["English", "Math", "Reading"] : sectionsFor(exam);
  const relevant = attempts.filter((a) => a.exam === exam);
  const scienceReady =
    exam === "ACT" &&
    includeScience &&
    relevant.filter((a) => a.section === "Science").length >= MIN_ATTEMPTS_PER_SECTION;
  const sections = scienceReady ? [...required, "Science"] : required;
  const needed: Record<string, number> = {};
  for (const s of required) {
    const n = relevant.filter((a) => a.section === s).length;
    if (n < MIN_ATTEMPTS_PER_SECTION) needed[s] = MIN_ATTEMPTS_PER_SECTION - n;
  }
  if (Object.keys(needed).length > 0) {
    return { ready: false, reason: "Not enough answered questions in every section yet.", needed };
  }
  const secs: SectionEstimate[] = sections.map((s) => {
    const list = relevant.filter((a) => a.section === s).slice(-40);
    const p = weightedAbility(list);
    if (exam === "SAT") {
      const mid = 200 + p * 600;
      const half = Math.max(40, 160 / Math.sqrt(list.length / 4));
      return {
        section: s,
        attempts: list.length,
        mid: round(mid, 10),
        low: clamp(round(mid - half, 10), 200, 800),
        high: clamp(round(mid + half, 10), 200, 800),
      };
    }
    const mid = 1 + p * 35;
    const half = Math.max(2, 8 / Math.sqrt(list.length / 4));
    return {
      section: s,
      attempts: list.length,
      mid: Math.round(mid),
      low: clamp(Math.round(mid - half), 1, 36),
      high: clamp(Math.round(mid + half), 1, 36),
    };
  });
  const basedOn = secs.reduce((s, x) => s + x.attempts, 0);
  if (exam === "SAT") {
    return {
      ready: true,
      exam,
      sections: secs,
      basedOn,
      mid: secs.reduce((s, x) => s + x.mid, 0),
      low: secs.reduce((s, x) => s + x.low, 0),
      high: secs.reduce((s, x) => s + x.high, 0),
    };
  }
  // ACT composite = average of English, Math and Reading (enhanced ACT). Science is listed in
  // `sections` when available but doesn't count toward the composite.
  const core = secs.filter((x) => x.section !== "Science");
  const avg = (k: "mid" | "low" | "high") =>
    Math.round(core.reduce((s, x) => s + x[k], 0) / core.length);
  return {
    ready: true,
    exam,
    sections: secs,
    basedOn,
    mid: avg("mid"),
    low: avg("low"),
    high: avg("high"),
  };
}

function round(n: number, step: number) {
  return Math.round(n / step) * step;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}
