/**
 * Question bank tooling.
 *
 * Questions are authored as "drafts" with the correct answer listed FIRST. `compile` then:
 *  - gives each question a stable id (so the database migration is idempotent),
 *  - orders choices the way the real tests do (numeric choices ascending, "NO CHANGE" first,
 *    otherwise a deterministic shuffle), and remaps the answer key and distractor notes,
 *  - validates every item (4 distinct choices, explanation present, etc.).
 *
 * Passage-based sets (ACT English/Reading/Science) share a `group` number. The group is encoded
 * in the id so practice tests can keep a passage's questions together and in order.
 */

export type Exam = "SAT" | "ACT";

export type Draft = {
  skill: string;
  d: 1 | 2 | 3;
  /** question stem */
  q: string;
  /** choices with the CORRECT answer first */
  c: string[];
  /** explanation */
  e: string;
  /** distractor notes keyed by index in `c` (1–3) */
  n?: Record<number, string>;
  /** passage / stimulus */
  p?: string | null;
  /** passage set number (keeps questions together in tests) */
  group?: number;
  secs?: number;
};

export type BankQuestion = {
  id: string;
  exam: Exam;
  section: string;
  skill_id: string;
  difficulty: 1 | 2 | 3;
  passage: string | null;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation: string;
  distractor_notes: Record<string, string>;
  est_seconds: number;
};

/** Section codes used inside ids: 5b0S… */
export const SECTION_CODE = {
  "SAT|Math": 1,
  "SAT|Reading and Writing": 2,
  "ACT|English": 3,
  "ACT|Math": 4,
  "ACT|Reading": 5,
  "ACT|Science": 6,
} as const;

export function bankId(code: number, group: number, n: number) {
  return `5b0${code}0000-${String(group).padStart(4, "0")}-4000-8000-${String(n).padStart(12, "0")}`;
}

/** Passage-set number encoded in a bank id (0 = standalone). Works for any uuid; non-bank ids return 0. */
export function groupOf(id: string) {
  if (!id.startsWith("5b0")) return 0;
  return Number(id.slice(9, 13)) || 0; // 5b0S0000-GGGG-…
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function numericValue(s: string): number | null {
  const t = s
    .replace(/[$,%°\s]/g, "")
    .replace(/−/g, "-")
    .replace(/(feet|ft|cm|inches|miles|meters|m|kg|g|hours|minutes|seconds)$/i, "");
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  const frac = t.match(/^(-?\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  return null;
}

export function orderChoices(id: string, choices: string[]): number[] {
  const idx = choices.map((_, i) => i);
  const nums = choices.map(numericValue);
  if (nums.every((v) => v !== null)) return idx.sort((a, b) => nums[a]! - nums[b]!);
  const noChange = choices.findIndex((c) => c.trim().toUpperCase() === "NO CHANGE");
  const rest = idx.filter((i) => i !== noChange);
  // seeded Fisher–Yates
  let seed = hash(id);
  const rnd = () => {
    seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return seed / 4294967296;
  };
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [rest[i], rest[j]] = [rest[j]!, rest[i]!];
  }
  return noChange >= 0 ? [noChange, ...rest] : rest;
}

export function compile(
  exam: Exam,
  section: string,
  defaultSecs: number,
  drafts: Draft[],
): BankQuestion[] {
  const code = SECTION_CODE[`${exam}|${section}` as keyof typeof SECTION_CODE];
  if (!code) throw new Error(`Unknown section ${exam} ${section}`);
  return drafts.map((dr, i) => {
    const id = bankId(code, dr.group ?? 0, i + 1);
    const where = `${exam} ${section} #${i + 1} (${dr.q.slice(0, 50)})`;
    if (dr.c.length !== 4) throw new Error(`${where}: needs exactly 4 choices`);
    if (new Set(dr.c.map((c) => c.trim().toLowerCase())).size !== 4)
      throw new Error(`${where}: duplicate choices`);
    if (!dr.e || dr.e.length < 15) throw new Error(`${where}: explanation missing`);
    const order = orderChoices(id, dr.c);
    const notes: Record<string, string> = {};
    for (const [k, v] of Object.entries(dr.n ?? {})) {
      const src = Number(k);
      if (src === 0) throw new Error(`${where}: note on the correct answer`);
      notes[String(order.indexOf(src))] = v;
    }
    return {
      id,
      exam,
      section,
      skill_id: dr.skill,
      difficulty: dr.d,
      passage: dr.p ?? null,
      prompt: dr.q,
      choices: order.map((o) => dr.c[o]!),
      correct_index: order.indexOf(0),
      explanation: dr.e,
      distractor_notes: notes,
      est_seconds: dr.secs ?? defaultSecs,
    };
  });
}

/**
 * ACT English passage helper. The template marks underlined portions as {{1}}, {{2}}, … and
 * `portions` gives their original wording. Each question's passage shows the whole text with
 * only its own portion underlined (rendered from __double underscores__).
 */
export function englishSet(
  group: number,
  title: string,
  template: string,
  portions: Record<number, string>,
  items: (Omit<Draft, "p" | "group" | "q"> & { at?: number; q?: string })[],
): Draft[] {
  const render = (active?: number) =>
    `${title}\n` +
    template.replace(/\{\{(\d+)\}\}/g, (_, k: string) => {
      const text = portions[Number(k)] ?? "";
      return Number(k) === active ? `__${text}__` : text;
    });
  return items.map((it) => ({
    ...it,
    q: it.q ?? "Which choice is best for the underlined portion?",
    p: render(it.at),
    group,
  }));
}

/** Shared-passage helper for ACT Reading and Science sets. */
export function passageSet(
  group: number,
  passage: string,
  items: Omit<Draft, "p" | "group">[],
): Draft[] {
  return items.map((it) => ({ ...it, p: passage, group }));
}
