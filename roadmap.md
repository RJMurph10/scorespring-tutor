# Roadmap — SAT/ACT Tutor

Done
- [x] Backend: profiles, skills, question bank (40 original seed questions), sessions, attempts, study tasks, lessons, tutor threads (RLS on all)
- [x] Learning engine: mastery, informal score estimate, adaptive picking, weekly study plan (+ tests)
- [x] Lesson content for all 16 skills

- [x] Design system, app shell (sidebar + mobile nav), landing, sign in (email + Google), password reset
- [x] Onboarding, dashboard
- [x] Question runner (diagnostic / practice / test modes)
- [x] AI tutor (separate saved conversations, step-by-step mode), similar-question generation with verification
- [x] Study plan, lessons, practice tests, progress, settings pages

Setup notes
- AI features call the Lovable AI gateway from the server (`src/lib/ai.server.ts`, `src/routes/api/tutor.ts`, `src/lib/ai.functions.ts`) and need `LOVABLE_API_KEY`, which Lovable provides when AI is enabled for the project. Optional `AI_MODEL` overrides the default model.
- Without the key, the tutor shows a setup message and the rest of the app works normally.

Next
- [ ] Grow the verified question bank (ACT especially: 4 per section today)
