import { QUESTION_BANK } from "./index";

function dollar(tag: string, s: string) {
  if (s.includes(`$${tag}$`)) throw new Error(`Text contains the $${tag}$ delimiter`);
  return `$${tag}$${s}$${tag}$`;
}

/** SQL that inserts the bank idempotently (safe to run more than once). */
export function questionBankSql() {
  const rows = QUESTION_BANK.map(
    (q) =>
      `('${q.id}','${q.exam}',${dollar("q", q.section)},'${q.skill_id}',${q.difficulty},${q.passage == null ? "null" : dollar("q", q.passage)},${dollar("q", q.prompt)},${dollar("j", JSON.stringify(q.choices))}::jsonb,${q.correct_index},${dollar("q", q.explanation)},${dollar("j", JSON.stringify(q.distractor_notes))}::jsonb,${q.est_seconds},'Original ScoreSpring practice content (AI-drafted; answer keys checked)','ai_generated','approved')`,
  );
  return `-- ScoreSpring question bank: ${QUESTION_BANK.length} original SAT- and ACT-style practice questions.
-- GENERATED from src/lib/question-bank — do not edit by hand. Regenerate with:
--   bun scripts/generate-question-bank.ts
-- Idempotent: rows that already exist (same id) are left untouched.
insert into public.questions (id, exam, section, skill_id, difficulty, passage, prompt, choices, correct_index, explanation, distractor_notes, est_seconds, source, generation_method, review_status) values
${rows.join(",\n")}
on conflict (id) do nothing;
`;
}
