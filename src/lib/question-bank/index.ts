import { ACT_ENGLISH } from "./act-english";
import { ACT_MATH } from "./act-math";
import { ACT_READING } from "./act-reading";
import { ACT_SCIENCE } from "./act-science";
import { compile, type BankQuestion } from "./build";
import { SAT_MATH } from "./sat-math";
import { SAT_RW } from "./sat-rw";

export { groupOf } from "./build";
export type { BankQuestion } from "./build";

/**
 * The full original question bank, compiled and validated.
 * Source of truth for drizzle/migrations/0001_question_bank.sql (regenerate with
 * `bun scripts/generate-question-bank.ts`) and for demo mode.
 * Default seconds per question follow the real tests' pacing.
 */
export const QUESTION_BANK: BankQuestion[] = [
  ...compile("SAT", "Math", 95, SAT_MATH),
  ...compile("SAT", "Reading and Writing", 71, SAT_RW),
  ...compile("ACT", "English", 42, ACT_ENGLISH),
  ...compile("ACT", "Math", 67, ACT_MATH),
  ...compile("ACT", "Reading", 67, ACT_READING),
  ...compile("ACT", "Science", 60, ACT_SCIENCE),
];
