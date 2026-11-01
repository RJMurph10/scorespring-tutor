import type { SkillStat } from "./mastery";

export type QuestionLite = { id: string; skill_id: string; difficulty: number; section: string };

export type SelectOptions = {
  count: number;
  stats: Map<string, SkillStat>;
  recentlySeen?: Set<string>;
  /** fraction of picks reserved for mastered/proficient skills as spaced review */
  reviewShare?: number;
  weakOnly?: boolean;
  random?: () => number;
};

/** Target difficulty for a skill given its mastery: struggling → easier, strong → harder. */
export function targetDifficulty(stat?: SkillStat): number {
  if (!stat || stat.attempts < 2) return 2;
  if (stat.mastery < 0.45) return 1;
  if (stat.mastery < 0.75) return 2;
  return 3;
}

/** Priority weight: lower mastery → higher weight. Unseen skills get a moderate weight so they get diagnosed. */
export function skillWeight(stat?: SkillStat): number {
  if (!stat) return 1.2;
  return 0.25 + (1 - stat.mastery) * 2;
}

/**
 * Pick questions prioritizing weak skills, near target difficulty, avoiding recently seen ones,
 * while reserving a share for review of strong skills (retention).
 */
export function selectAdaptive(pool: QuestionLite[], opts: SelectOptions): string[] {
  const rnd = opts.random ?? Math.random;
  const seen = opts.recentlySeen ?? new Set<string>();
  const reviewShare = opts.weakOnly ? 0 : (opts.reviewShare ?? 0.2);
  const fresh = pool.filter((q) => !seen.has(q.id));
  const candidates = fresh.length >= opts.count ? fresh : [...fresh, ...pool.filter((q) => seen.has(q.id))];

  const isStrong = (s?: SkillStat) => !!s && (s.level === "mastered" || s.level === "proficient");
  const strongPool = candidates.filter((q) => isStrong(opts.stats.get(q.skill_id)));
  const weakPool = candidates.filter((q) => !isStrong(opts.stats.get(q.skill_id)));
  const reviewCount = Math.min(strongPool.length, Math.round(opts.count * reviewShare));

  const score = (q: QuestionLite) => {
    const st = opts.stats.get(q.skill_id);
    const dist = Math.abs(q.difficulty - targetDifficulty(st));
    return skillWeight(st) * (1 / (1 + dist)) * (0.6 + 0.8 * rnd()) * (seen.has(q.id) ? 0.3 : 1);
  };

  const pick = (list: QuestionLite[], n: number, taken: Set<string>) => {
    const ranked = list.filter((q) => !taken.has(q.id)).map((q) => ({ q, s: score(q) }));
    ranked.sort((a, b) => b.s - a.s);
    // spread across skills: at most ceil(n/2) per skill in the first pass
    const perSkill = new Map<string, number>();
    const cap = Math.max(1, Math.ceil(n / 2));
    const out: string[] = [];
    for (const { q } of ranked) {
      if (out.length >= n) break;
      const c = perSkill.get(q.skill_id) ?? 0;
      if (c >= cap) continue;
      perSkill.set(q.skill_id, c + 1);
      out.push(q.id);
      taken.add(q.id);
    }
    for (const { q } of ranked) {
      if (out.length >= n) break;
      if (!taken.has(q.id)) {
        out.push(q.id);
        taken.add(q.id);
      }
    }
    return out;
  };

  const taken = new Set<string>();
  const main = pick(opts.weakOnly ? weakPool.length ? weakPool : candidates : weakPool, opts.count - reviewCount, taken);
  const review = pick(strongPool, reviewCount, taken);
  const rest = main.length + review.length < opts.count ? pick(candidates, opts.count - main.length - review.length, taken) : [];
  const all = [...main, ...review, ...rest];
  // shuffle order lightly so review isn't always at the end
  return all.map((id) => ({ id, k: rnd() })).sort((a, b) => a.k - b.k).map((x) => x.id);
}
