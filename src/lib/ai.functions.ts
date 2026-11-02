import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { aiConfigured, aiModel, extractJson, studentContext } from "@/lib/ai.server";

/** Lets the UI show a setup message instead of pretending AI ran. */
export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: aiConfigured(),
}));

const generatedSchema = z.object({
  passage: z.string().nullable().optional(),
  prompt: z.string().min(8),
  choices: z.array(z.string().min(1)).length(4),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
  distractor_notes: z.record(z.string(), z.string()).optional(),
});

const verifySchema = z.object({
  answer_index: z.number().int().min(0).max(3),
  ambiguous: z.boolean(),
  issues: z.string().optional(),
});

/**
 * Question generation and answer validation are separate model calls: one writes the item,
 * a second solves it blind. Only items where the blind solve matches the key (and nothing is
 * flagged ambiguous) are saved — as ai_verified, visible only to this student.
 */
export const generateSimilarQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { questionId: string }) => z.object({ questionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const src = await supabase.from("questions").select("*").eq("id", data.questionId).single();
    if (src.error || !src.data) throw new Error("Source question not found");
    const q = src.data;
    const model = aiModel();
    const examNote =
      q.exam === "SAT"
        ? "Digital SAT style: concise, one question per short passage for Reading and Writing."
        : "Enhanced ACT style. ACT English questions may refer to an underlined portion — include the full sentence in the passage and mark the portion with [brackets].";

    let lastIssue = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      const gen = await generateText({
        model,
        system: `You write original ${q.exam} practice questions for the ${q.section} section. ${examNote}
Return ONLY a JSON object: {"passage": string|null, "prompt": string, "choices": [4 strings], "correct_index": 0-3, "explanation": string, "distractor_notes": {"<index>": "why this tempting choice is wrong"}}.
Rules: exactly one defensible correct answer; realistic distractors that reflect common mistakes; test the same skill as the source at difficulty ${q.difficulty}/3 but change the numbers, context and wording; do not copy the source; explanation shows the reasoning step by step; plain text math (x², √).`,
        prompt: `Source question (skill ${q.skill_id}):
${q.passage ? `Passage: ${q.passage}\n` : ""}Prompt: ${q.prompt}
Choices: ${JSON.stringify(q.choices)}
Correct: ${q.correct_index}
${lastIssue ? `A previous draft was rejected by the reviewer: ${lastIssue}. Fix that.` : ""}`,
      });
      let item: z.infer<typeof generatedSchema>;
      try {
        item = generatedSchema.parse(extractJson(gen.text));
      } catch {
        lastIssue = "output was not valid JSON in the required shape";
        continue;
      }
      if (new Set(item.choices.map((c) => c.trim().toLowerCase())).size !== 4) {
        lastIssue = "answer choices were not distinct";
        continue;
      }

      const check = await generateText({
        model,
        system:
          'You are a strict reviewer of standardized-test questions. Solve the question independently. Return ONLY JSON: {"answer_index": 0-3, "ambiguous": boolean, "issues": string}. Set ambiguous=true if more than one choice could be defended, if no choice is correct, or if information is missing.',
        prompt: `${item.passage ? `Passage: ${item.passage}\n` : ""}Question: ${item.prompt}\nChoices:\n${item.choices.map((c, i) => `${i}. ${c}`).join("\n")}`,
      });
      let verdict: z.infer<typeof verifySchema>;
      try {
        verdict = verifySchema.parse(extractJson(check.text));
      } catch {
        lastIssue = "reviewer could not parse the question";
        continue;
      }
      if (verdict.ambiguous || verdict.answer_index !== item.correct_index) {
        lastIssue =
          verdict.issues ||
          `reviewer chose ${verdict.answer_index} but key said ${item.correct_index}`;
        continue;
      }

      const ins = await supabase
        .from("questions")
        .insert({
          exam: q.exam,
          section: q.section,
          skill_id: q.skill_id,
          difficulty: q.difficulty,
          passage: item.passage ?? null,
          prompt: item.prompt,
          choices: item.choices as unknown as Json,
          correct_index: item.correct_index,
          explanation: item.explanation,
          distractor_notes: (item.distractor_notes ?? {}) as unknown as Json,
          est_seconds: q.est_seconds,
          source: "Original AI-generated practice (verified by a second AI review)",
          generation_method: "ai_generated",
          review_status: "ai_verified",
          created_by: userId,
        })
        .select("*")
        .single();
      if (ins.error) throw new Error(ins.error.message);
      return ins.data;
    }
    throw new Error("Couldn't produce a question that passed verification. Try again.");
  });

/** Plain-language analysis of recurring mistakes with concrete next steps. */
export const analyzeMistakes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = await studentContext(context.supabase, context.userId);
    const res = await generateText({
      model: aiModel(),
      system:
        "You are an SAT/ACT tutor reviewing a student's practice data. Write a short analysis (under 180 words) in markdown: 1) the 2–3 recurring mistake patterns you see, each tied to a specific skill, 2) a concrete next step for each. Base every claim on the data; if there's too little data, say so plainly and suggest what to practice to get a clearer picture. No generic encouragement.",
      prompt: ctx.text,
    });
    return { markdown: res.text };
  });
