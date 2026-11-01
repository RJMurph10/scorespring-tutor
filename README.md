# ScoreSpring Tutor

Build an AI-Powered Personalized SAT & ACT Tutor

Build a polished, modern, AI-powered educational web application that serves as a personalized SAT and ACT test preparation tutor. The app should help high school students improve their scores through adaptive learning, targeted practice, detailed explanations, and personalized study plans.

The product should feel like a combination of a private SAT/ACT tutor, Khan Academy, and a modern AI learning platform. Prioritize an excellent user experience, useful educational features, and a clean, professional interface.

## 1. Core Product Philosophy

The central feature is personalization. Every student should receive a learning experience tailored to their current ability, target score, test date, strengths, weaknesses, and available study time.

The application should:
- Identify specific skill gaps through diagnostic assessments.
- Generate personalized study plans.
- Teach concepts in a conversational, easy-to-understand way.
- Provide realistic SAT and ACT practice questions.
- Explain why answers are correct or incorrect.
- Adapt future practice based on previous performance.
- Track score improvements and estimate readiness.
- Encourage consistent studying without overwhelming the student.

Do not make this a static question bank with a generic chatbot. The tutor should use the student's performance and learning history to determine what to teach next.

## 2. User Onboarding and Student Profile

Create an onboarding flow for new students.

Collect:
- Preferred test: SAT, ACT, or both.
- Current practice score, if known.
- Target score.
- Test date.
- Grade level.
- Minutes available to study per day.
- Number of days per week they want to study.
- Strongest and weakest subjects, if known.
- Preferred learning style: explanations, worked examples, practice problems, or a mixture.

Allow students who do not know their current score to take a diagnostic assessment.

Use this information to create an initial personalized study plan. Let students edit their goals and schedule later.

## 3. Student Dashboard

Create a visually appealing dashboard that includes:

- Welcome message and daily study recommendation.
- Current SAT or ACT practice score.
- Target score and progress toward the goal.
- Estimated score range based on available practice data.
- Daily study streak.
- Weekly study time.
- Skill mastery by subject.
- Recent quiz results.
- Upcoming test date with a countdown.
- A prominent "Continue Learning" button.
- A "Practice Weakest Skill" button.
- A "Ask Your AI Tutor" button.

Include clear visual progress indicators and charts. Make the dashboard informative without overcrowding it.

Do not display fabricated scores or progress. For new students, show onboarding steps and recommend a diagnostic test until sufficient data exists.

## 4. Personalized AI Tutor

This is the primary feature of the application.

Create an interactive tutoring interface where students can ask questions about SAT and ACT concepts, submit answers, request examples, and receive step-by-step explanations.

The tutor should:
- Explain difficult concepts at the student's current level.
- Break complex problems into manageable steps.
- Ask guiding questions instead of immediately revealing answers when appropriate.
- Identify the misconception behind an incorrect answer.
- Generate similar problems to reinforce learning.
- Offer hints before showing complete solutions.
- Remember the student's demonstrated strengths and weaknesses through saved learning data.
- Adjust the complexity of explanations based on performance.
- Support follow-up questions and conversational learning.
- Encourage students without using excessive praise or generic responses.

Add suggested prompts such as:
- "Teach me SAT quadratic equations."
- "Why was my answer wrong?"
- "Help me improve SAT reading."
- "Give me a harder practice question."
- "Explain this like I'm a beginner."
- "Quiz me on my weakest skills."

The tutor must distinguish between SAT and ACT formats and use the appropriate content for the selected exam.

Provide a dedicated problem-solving mode where students can work through questions one step at a time.

## 5. Diagnostic Assessments

Build an initial diagnostic assessment for each test.

For the SAT, organize assessments around:
- Reading and Writing.
- Math.

For the ACT, organize assessments around:
- English.
- Math.
- Reading.
- Science, using the current ACT format selected for the student.
- Writing as an optional separate preparation module.

Assessments should sample different difficulty levels and skill categories.

For each answer, save:
- Selected answer.
- Correct answer.
- Time spent.
- Difficulty.
- Topic and skill category.
- Whether the student answered correctly.
- Confidence level, if provided.

Use these results to identify weak skills and recommend targeted lessons.

Clearly distinguish an informal diagnostic score estimate from an official score or a validated full-length practice test. Do not claim a short quiz produces a precise official score.

## 6. Adaptive Practice Engine

Create a personalized practice section that generates targeted exercises based on student performance.

Features:
- Practice by test, subject, topic, or difficulty.
- Quick 5-question, 10-question, and 20-question sessions.
- Mixed-topic practice.
- Timed practice.
- Untimed learning mode.
- Review of missed questions.
- Reattempts with new, similar questions.
- Difficulty that adjusts as the student improves.
- A dedicated weak-skill training mode.

Prioritize skills the student struggles with while periodically reviewing mastered skills to improve retention.

Each question must have a reliable answer key and a clear explanation. Verify generated questions for ambiguity, correctness, and consistency before presenting them to students.

Do not generate questions that merely imitate superficial test formatting. Questions should test relevant skills and use realistic distractors.

## 7. Question Experience

Design a focused, distraction-free testing interface.

Each question should display:
- Test and section.
- Question number.
- Question text and any necessary passage, table, graph, or diagram.
- Answer choices.
- A flag-for-review option.
- A hint option when in learning mode.
- A submit or next button.
- A progress indicator.

After submitting an answer in learning mode, show whether it was correct, explain the reasoning, and explain why the most tempting incorrect options are wrong when appropriate.

In test simulation mode, hide explanations until the section or test is complete.

Include keyboard-friendly navigation and accessible controls.

## 8. Personalized Study Plan

Automatically create a study plan using the student's diagnostic results, target score, test date, and available study time.

Organize the plan into:
- Priority skills.
- Short lessons.
- Guided practice.
- Timed drills.
- Spaced review.
- Weekly progress checks.
- Full-length or section-length practice tests as the exam approaches.

Each task should have an estimated completion time and a clear learning objective.

For example, a student who struggles with algebra should receive more algebra practice than a student who already demonstrates mastery.

Let students reschedule missed sessions without losing their overall plan.

Recalculate recommendations as new performance data becomes available.

If the student has very little time before the test, prioritize the most valuable areas rather than presenting an unrealistic workload.

## 9. Lessons and Learning Library

Build a structured learning library organized by exam, subject, and skill.

SAT Math topics should include:
- Algebra.
- Advanced Math.
- Problem-Solving and Data Analysis.
- Geometry and Trigonometry.

SAT Reading and Writing topics should include:
- Information and Ideas.
- Craft and Structure.
- Expression of Ideas.
- Standard English Conventions.

ACT topics should reflect the current format selected by the student and include relevant English, math, reading, and science skills.

Each topic should contain:
1. A concise concept explanation.
2. Worked examples.
3. Common mistakes.
4. Practice questions.
5. A mastery check.
6. Recommended next steps.

Track completion and demonstrated mastery separately. Completing a lesson alone should not automatically mark a skill as mastered.

## 10. Performance Analytics

Create a progress analytics page featuring:
- Score history over time.
- Subject-level performance.
- Accuracy by skill.
- Performance by difficulty.
- Average time per question.
- Changes in accuracy after reviewing a topic.
- Most frequently missed concepts.
- Skills improving fastest.
- Skills requiring more attention.

Display score ranges and predictions only when enough relevant data is available. Explain that projections are estimates, not guarantees.

Include actionable recommendations based on the student's results rather than displaying charts without interpretation.

## 11. Full-Length Practice Tests

Create a test simulation mode with:
- Configurable SAT or ACT practice tests.
- Realistic section structure and timing based on the selected test format.
- Timed sections.
- Breaks where appropriate.
- Navigation and flagging.
- Saved progress if the student exits.
- A final results page.
- Detailed answer explanations after completion.
- Section-level performance and skill analysis.

Clearly label original AI-generated tests as unofficial practice tests. Do not represent them as official College Board or ACT exams.

Build the data model to support importing properly licensed practice questions in the future.

## 12. Design and User Interface

Use a premium, modern educational SaaS aesthetic.

Design direction:
- Clean white or very light neutral backgrounds.
- Deep navy text with blue as the primary accent.
- Subtle green accents for correct answers and progress.
- Soft card borders, restrained shadows, and rounded corners.
- Modern typography and generous spacing.
- Simple, readable charts.
- Smooth, subtle interactions.
- Responsive layouts for desktop, tablet, and mobile.

Use a persistent sidebar on desktop with:
- Dashboard.
- AI Tutor.
- Practice.
- Study Plan.
- Lessons.
- Practice Tests.
- Progress.
- Settings.

On mobile, replace the sidebar with a compact navigation pattern.

Avoid excessive gradients, distracting animations, cartoonish graphics, and oversized empty sections. The app should look credible enough that parents and students would trust it as a serious educational product.

## 13. Authentication and Data Persistence

Implement secure user authentication and persistent storage.

Use Supabase for:
- User accounts.
- Student profiles.
- Learning preferences.
- Diagnostic attempts.
- Question attempts.
- Skill mastery.
- Study plans.
- Completed lessons.
- Practice test results.
- AI tutor conversation history where appropriate.

Design a relational schema with appropriate relationships and indexes.

Apply row-level security so students can access only their own private learning records. Protect any AI service credentials and privileged operations on the server.

Include useful loading, error, empty, and success states throughout the application.

## 14. AI Integration

Integrate an actual AI model through a secure server-side function.

The AI should support:
- Conversational tutoring.
- Step-by-step explanations.
- Targeted lesson generation.
- Similar-question generation.
- Personalized study recommendations.
- Analysis of recurring mistakes.

Pass the student's relevant learning context to the AI when useful, without sending unnecessary personal information.

Keep tutoring, question generation, answer validation, and score estimation as distinct operations so each can be tested and improved.

Never expose API keys in frontend code.

If AI credentials are not configured, show a clear setup message or a functional non-AI fallback. Do not pretend an AI response was generated when it was not.

## 15. Question Bank and Content Quality

Build a structured question system that stores:
- Exam.
- Section.
- Topic.
- Skill.
- Difficulty.
- Question content.
- Answer choices.
- Correct answer.
- Explanation.
- Estimated solving time.
- Source or generation method.
- Content review status.

Use a small, high-quality seed set of verified sample questions to demonstrate the app.

Prefer reliable, prevalidated questions for scored assessments. AI-generated questions should be validated before being added to the active question bank.

Do not use copyrighted official questions unless appropriately licensed. Clearly identify original practice content and provide appropriate attribution for licensed or authorized sources.

## 16. MVP Priorities

Build the application in a functional order:

Phase 1:
- Responsive UI and navigation.
- Authentication.
- Student onboarding.
- Dashboard.
- SAT/ACT selection.
- Diagnostic assessment.
- Persistent question attempts and student profiles.

Phase 2:
- AI tutor.
- Targeted practice.
- Skill tracking.
- Personalized study plan.
- Lessons and explanations.

Phase 3:
- Analytics.
- Timed section simulations.
- Full-length practice test framework.
- More advanced adaptive difficulty.
- Improved score estimation.

Prioritize a working end-to-end student experience over a large number of incomplete screens.

## 17. Important Implementation Requirements

- Build a real application, not just a static mockup.
- Every major navigation item should lead to a functional screen.
- Use reusable components and maintainable code.
- Connect forms and interactions to persistent data.
- Do not leave fake buttons or hardcoded progress values in the finished product.
- Do not use fabricated student histories or fabricated performance analytics.
- Make the core experience usable before adding advanced features.
- Clearly communicate limitations when official scoring or AI features are not configured.
- Use a modular architecture that supports future subscriptions, additional exams, and a larger question bank.

The ultimate goal is to create a personalized digital tutor that helps students understand concepts, practice intelligently, learn from their mistakes, and improve their SAT or ACT performance through measurable progress.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b4a59f0-0041-4cae-9de2-ae3de7fe956d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
