// Regenerates drizzle/migrations/0001_question_bank.sql from src/lib/question-bank.
// Run: bun scripts/generate-question-bank.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { questionBankSql } from "../src/lib/question-bank/sql";

const out = join(import.meta.dirname, "..", "drizzle", "migrations", "0001_question_bank.sql");
writeFileSync(out, questionBankSql());
console.log(`Wrote ${out}`);
