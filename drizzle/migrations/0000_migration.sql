
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  exam text not null default 'SAT' check (exam in ('SAT','ACT','BOTH')),
  active_exam text not null default 'SAT' check (active_exam in ('SAT','ACT')),
  current_score int,
  target_score int,
  test_date date,
  grade int,
  minutes_per_day int not null default 30,
  days_per_week int not null default 5,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  learning_style text not null default 'mixed' check (learning_style in ('explanations','examples','practice','mixed')),
  act_include_science boolean not null default true,
  act_include_writing boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- SKILLS (taxonomy)
create table public.skills (
  id text primary key,
  exam text not null check (exam in ('SAT','ACT')),
  section text not null,
  domain text not null,
  name text not null,
  sort int not null default 0
);
grant select on public.skills to authenticated;
grant all on public.skills to service_role;
alter table public.skills enable row level security;
create policy "skills readable" on public.skills for select to authenticated using (true);

-- QUESTIONS
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('SAT','ACT')),
  section text not null,
  skill_id text not null references public.skills(id),
  difficulty smallint not null check (difficulty between 1 and 3),
  passage text,
  prompt text not null,
  choices jsonb not null,
  correct_index smallint not null,
  explanation text not null,
  distractor_notes jsonb not null default '{}'::jsonb,
  est_seconds int not null default 75,
  source text not null default 'Original practice content',
  generation_method text not null default 'human_authored' check (generation_method in ('human_authored','ai_generated','licensed_import')),
  review_status text not null default 'approved' check (review_status in ('approved','ai_verified','pending','rejected')),
  created_by uuid,
  created_at timestamptz not null default now()
);
create index questions_skill_idx on public.questions(skill_id, difficulty);
create index questions_exam_idx on public.questions(exam, section);
grant select, insert on public.questions to authenticated;
grant all on public.questions to service_role;
alter table public.questions enable row level security;
create policy "approved or own questions" on public.questions for select to authenticated
  using (review_status = 'approved' or created_by = auth.uid());
create policy "insert own ai questions" on public.questions for insert to authenticated
  with check (created_by = auth.uid() and generation_method = 'ai_generated' and review_status in ('ai_verified','pending'));

-- SESSIONS (diagnostics, practice, tests)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null check (kind in ('diagnostic','practice','test')),
  exam text not null check (exam in ('SAT','ACT')),
  mode text not null default 'learning' check (mode in ('learning','timed','simulation')),
  title text not null,
  config jsonb not null default '{}'::jsonb,
  question_ids uuid[] not null default '{}',
  state jsonb not null default '{}'::jsonb,
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  results jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index sessions_user_idx on public.sessions(user_id, started_at desc);
grant select, insert, update, delete on public.sessions to authenticated;
grant all on public.sessions to service_role;
alter table public.sessions enable row level security;
create policy "own sessions" on public.sessions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- QUESTION ATTEMPTS
create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid references public.sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  kind text not null check (kind in ('diagnostic','practice','test')),
  exam text not null,
  section text not null,
  skill_id text not null references public.skills(id),
  difficulty smallint not null,
  selected_index smallint,
  correct_index smallint not null,
  is_correct boolean not null,
  time_ms int not null default 0,
  confidence smallint check (confidence between 1 and 3),
  used_hint boolean not null default false,
  created_at timestamptz not null default now()
);
create index attempts_user_time_idx on public.question_attempts(user_id, created_at desc);
create index attempts_user_skill_idx on public.question_attempts(user_id, skill_id);
grant select, insert on public.question_attempts to authenticated;
grant all on public.question_attempts to service_role;
alter table public.question_attempts enable row level security;
create policy "own attempts select" on public.question_attempts for select to authenticated using (auth.uid() = user_id);
create policy "own attempts insert" on public.question_attempts for insert to authenticated with check (auth.uid() = user_id);

-- STUDY TASKS
create table public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  scheduled_date date not null,
  kind text not null check (kind in ('lesson','guided_practice','timed_drill','review','progress_check','practice_test','diagnostic')),
  skill_id text references public.skills(id),
  exam text not null,
  title text not null,
  objective text not null,
  minutes int not null,
  status text not null default 'pending' check (status in ('pending','done','skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index study_tasks_user_date_idx on public.study_tasks(user_id, scheduled_date);
grant select, insert, update, delete on public.study_tasks to authenticated;
grant all on public.study_tasks to service_role;
alter table public.study_tasks enable row level security;
create policy "own tasks" on public.study_tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- LESSON PROGRESS (completion only; mastery comes from attempts)
create table public.lesson_progress (
  user_id uuid not null,
  skill_id text not null references public.skills(id),
  completed_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
grant select, insert, delete on public.lesson_progress to authenticated;
grant all on public.lesson_progress to service_role;
alter table public.lesson_progress enable row level security;
create policy "own lessons" on public.lesson_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TUTOR CONVERSATIONS
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'New conversation',
  exam text not null default 'SAT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_user_idx on public.conversations(user_id, updated_at desc);
grant select, insert, update, delete on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;
create policy "own conversations" on public.conversations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null,
  sdk_id text,
  role text not null check (role in ('user','assistant')),
  parts jsonb not null,
  created_at timestamptz not null default now()
);
create index chat_messages_conv_idx on public.chat_messages(conversation_id, created_at);
grant select, insert, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;
alter table public.chat_messages enable row level security;
create policy "own messages" on public.chat_messages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SEED SKILLS
insert into public.skills (id, exam, section, domain, name, sort) values
('sat-algebra','SAT','Math','Algebra','Linear equations, inequalities & systems',1),
('sat-advanced-math','SAT','Math','Advanced Math','Nonlinear functions & quadratics',2),
('sat-psda','SAT','Math','Problem-Solving and Data Analysis','Ratios, percentages, statistics & probability',3),
('sat-geo-trig','SAT','Math','Geometry and Trigonometry','Area, triangles, circles & right-triangle trig',4),
('sat-info-ideas','SAT','Reading and Writing','Information and Ideas','Central ideas, evidence & inferences',5),
('sat-craft-structure','SAT','Reading and Writing','Craft and Structure','Words in context, text structure & purpose',6),
('sat-expression-ideas','SAT','Reading and Writing','Expression of Ideas','Transitions & rhetorical synthesis',7),
('sat-conventions','SAT','Reading and Writing','Standard English Conventions','Boundaries, agreement & sentence form',8),
('act-eng-conventions','ACT','English','Conventions of Standard English','Punctuation, usage & sentence structure',9),
('act-eng-rhetoric','ACT','English','Production of Writing','Concision, relevance & organization',10),
('act-math-algebra','ACT','Math','Algebra & Functions','Equations, slope & functions',11),
('act-math-geometry','ACT','Math','Geometry','Perimeter, angles & shapes',12),
('act-reading-key-ideas','ACT','Reading','Key Ideas and Details','Details, inferences & main ideas',13),
('act-reading-craft','ACT','Reading','Craft and Structure','Word choice, tone & function',14),
('act-sci-data','ACT','Science','Interpretation of Data','Reading tables & trends',15),
('act-sci-experiments','ACT','Science','Scientific Investigation','Variables, controls & design',16);

-- SEED QUESTIONS (original, human-authored)
insert into public.questions (exam, section, skill_id, difficulty, passage, prompt, choices, correct_index, explanation, distractor_notes, est_seconds) values
('SAT','Math','sat-algebra',1,null,$q$If 3x + 7 = 22, what is the value of x?$q$,$j$["3","5","7","15"]$j$,1,$q$Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.$q$,$j${"3":"15 is the value of 3x. You stopped one step early — divide by 3."}$j$,60),
('SAT','Math','sat-algebra',2,null,$q$A gym charges a one-time $25 sign-up fee plus $15 per month. Which equation gives the total cost C, in dollars, after m months?$q$,$j$["C = 15m + 25","C = 25m + 15","C = 40m","C = 15(m + 25)"]$j$,0,$q$The monthly charge is the rate that multiplies m (15m). The one-time fee is added once (+25). So C = 15m + 25.$q$,$j${"1":"This swaps the rate and the fixed fee.","2":"This charges the sign-up fee every month."}$j$,75),
('SAT','Math','sat-algebra',3,null,$q$2x + y = 11 and x − y = 1. What is the value of x?$q$,$j$["3","4","5","6"]$j$,1,$q$Add the equations to eliminate y: 3x = 12, so x = 4. Check: y = 3, and 2(4) + 3 = 11.$q$,$j${"0":"3 is the value of y, not x."}$j$,90),
('SAT','Math','sat-advanced-math',1,null,$q$If f(x) = x² − 4x, what is f(5)?$q$,$j$["5","−5","45","1"]$j$,0,$q$f(5) = 5² − 4(5) = 25 − 20 = 5.$q$,$j${"2":"45 comes from adding 20 instead of subtracting it."}$j$,60),
('SAT','Math','sat-advanced-math',2,null,$q$What are the solutions to x² − 5x + 6 = 0?$q$,$j$["2 and 3","−2 and −3","1 and 6","−1 and 6"]$j$,0,$q$Factor: (x − 2)(x − 3) = 0, so x = 2 or x = 3.$q$,$j${"1":"These are the numbers inside the factors, not the solutions — set each factor equal to zero."}$j$,75),
('SAT','Math','sat-advanced-math',3,null,$q$If (x + 3)² = 49 and x > 0, what is the value of x?$q$,$j$["10","7","4","46"]$j$,2,$q$Take the square root: x + 3 = 7 or x + 3 = −7. Since x > 0, x + 3 = 7, so x = 4.$q$,$j${"1":"7 is the value of x + 3, not x.","0":"10 comes from adding 3 instead of subtracting."}$j$,90),
('SAT','Math','sat-psda',1,null,$q$A shirt originally priced at $40 is discounted by 25%. What is the sale price?$q$,$j$["$10","$15","$30","$35"]$j$,2,$q$25% of $40 is $10. The sale price is $40 − $10 = $30.$q$,$j${"0":"$10 is the discount, not the sale price."}$j$,60),
('SAT','Math','sat-psda',2,null,$q$What is the mean of the data set 4, 7, 7, 9, 13?$q$,$j$["7","8","9","13"]$j$,1,$q$The sum is 4 + 7 + 7 + 9 + 13 = 40. Divide by 5 values: 40 ÷ 5 = 8.$q$,$j${"0":"7 is the median and the mode, not the mean."}$j$,60),
('SAT','Math','sat-psda',3,null,$q$In a random sample of 200 students at a school, 120 said they prefer online homework. The school has 1,500 students. Based on the sample, which is the best estimate of the number of students at the school who prefer online homework?$q$,$j$["120","600","900","1,380"]$j$,2,$q$The sample proportion is 120/200 = 0.6. Apply it to the population: 0.6 × 1,500 = 900.$q$,$j${"0":"120 is the count in the sample, not the school.","3":"This adds the sample count to the population instead of using a proportion."}$j$,90),
('SAT','Math','sat-geo-trig',1,null,$q$A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?$q$,$j$["10","14","12","48"]$j$,0,$q$By the Pythagorean theorem, c² = 6² + 8² = 36 + 64 = 100, so c = 10.$q$,$j${"1":"14 adds the legs; the theorem adds their squares."}$j$,60),
('SAT','Math','sat-geo-trig',2,null,$q$What is the area of a circle with radius 5?$q$,$j$["10π","25π","5π","100π"]$j$,1,$q$Area = πr² = π(5²) = 25π.$q$,$j${"0":"10π is the circumference (2πr)."}$j$,60),
('SAT','Math','sat-geo-trig',3,null,$q$In right triangle ABC, angle C is the right angle and sin A = 3/5. What is cos A?$q$,$j$["3/4","4/3","4/5","5/3"]$j$,2,$q$sin A = opposite/hypotenuse = 3/5, so use a 3-4-5 triangle: the adjacent side is 4. cos A = adjacent/hypotenuse = 4/5.$q$,$j${"0":"3/4 is tan A.","1":"4/3 is the reciprocal of tan A."}$j$,90),
('SAT','Reading and Writing','sat-info-ideas',1,$q$Honeybees communicate the location of food through a "waggle dance." The angle of the dance relative to vertical indicates the direction of the food relative to the sun, while the duration of the waggle portion signals how far away the food is.$q$,$q$According to the text, what does the duration of the waggle portion indicate?$q$,$j$["The direction of the food","The distance to the food","The quality of the food","The number of bees needed"]$j$,1,$q$The text states that the duration of the waggle "signals how far away the food is" — that is distance.$q$,$j${"0":"Direction is shown by the angle of the dance, not its duration."}$j$,70),
('SAT','Reading and Writing','sat-info-ideas',2,$q$Ecologist Lena Ortiz hypothesized that community gardens increase the variety of bird species in city neighborhoods. To test this, she surveyed birds in 30 neighborhoods with different numbers of gardens.$q$,$q$Which finding, if true, would most directly support Ortiz's hypothesis?$q$,$j$["Neighborhoods with more community gardens had more bird species recorded.","Birds in cities sing at higher pitches than birds in rural areas.","Most community gardens are planted in the spring.","Neighborhoods without gardens had more total trees."]$j$,0,$q$The hypothesis links gardens to bird variety (number of species). Only the first choice connects more gardens with more species.$q$,$j${"3":"Trees are not part of the hypothesis, and this says nothing about species variety."}$j$,80),
('SAT','Reading and Writing','sat-info-ideas',3,$q$When the city library eliminated late fees, some officials worried that fewer books would be returned. However, the return rate stayed nearly the same, while the number of active cardholders rose by 18 percent in the following year.$q$,$q$Which choice best states the main idea of the text?$q$,$j$["Officials were wrong about most library policies.","Late fees are the main source of library funding.","Active cardholders return books more quickly than others.","Eliminating late fees increased library use without substantially reducing book returns."]$j$,3,$q$The text contrasts the worry (fewer returns) with the result (returns unchanged, more cardholders). The last choice captures both parts.$q$,$j${"0":"Too broad — the text discusses only one policy."}$j$,90),
('SAT','Reading and Writing','sat-craft-structure',1,$q$The new bridge design was so ______ that engineers from several countries traveled to study it.$q$,$q$Which choice completes the text with the most logical and precise word?$q$,$j$["ordinary","innovative","fragile","hidden"]$j$,1,$q$Engineers traveling to study a design implies it is new and noteworthy — "innovative."$q$,$j${"0":"An ordinary design would not attract international study."}$j$,60),
('SAT','Reading and Writing','sat-craft-structure',2,$q$Although critics initially dismissed the novel as sentimental, later readers have praised its careful portrait of rural labor.$q$,$q$Which choice best describes the function of the first clause ("Although critics … sentimental") in the sentence?$q$,$j$["It presents an earlier view that the rest of the sentence contrasts.","It summarizes the novel's plot.","It provides evidence that the novel was popular.","It explains why the author wrote the novel."]$j$,0,$q$"Although" signals contrast: the critics' early dismissal is set against later praise.$q$,$j${"2":"Being dismissed by critics is not evidence of popularity."}$j$,70),
('SAT','Reading and Writing','sat-craft-structure',3,$q$The scientist's tone in the report was measured: she noted the promising results but cautioned that the sample was small.$q$,$q$As used in the text, what does "measured" most nearly mean?$q$,$j$["calculated numerically","restrained","lengthy","rhythmic"]$j$,1,$q$The colon explains the tone: she balances promise with caution. That describes a restrained, careful tone.$q$,$j${"0":"This is a common meaning of \"measured,\" but it doesn't fit a description of tone."}$j$,80),
('SAT','Reading and Writing','sat-expression-ideas',1,$q$Maria practiced the piano every day for a year. ______ she performed flawlessly at the recital.$q$,$q$Which choice completes the text with the most logical transition?$q$,$j$["However,","As a result,","Similarly,","In contrast,"]$j$,1,$q$Daily practice leads to a flawless performance — a cause and effect, so "As a result."$q$,$j${"0":"\"However\" signals contrast, but the second sentence follows from the first."}$j$,50),
('SAT','Reading and Writing','sat-expression-ideas',2,$q$Solar panels have become far cheaper over the past decade. ______ many homeowners still cite installation costs as a barrier.$q$,$q$Which choice completes the text with the most logical transition?$q$,$j$["Therefore,","For example,","Nevertheless,","Likewise,"]$j$,2,$q$The second sentence is surprising given the first (cheaper, yet still seen as costly), so a contrast transition — "Nevertheless" — fits.$q$,$j${"0":"\"Therefore\" implies the barrier is caused by panels getting cheaper."}$j$,60),
('SAT','Reading and Writing','sat-expression-ideas',3,$q$While researching a topic, a student has taken the following notes:
• Mount Everest is 8,849 meters tall.
• K2 is 8,611 meters tall.
• Both mountains are in Asia.$q$,$q$The student wants to emphasize the difference in height between the two mountains. Which choice most effectively uses relevant information from the notes to accomplish this goal?$q$,$j$["Mount Everest and K2 are both mountains in Asia.","K2 is a mountain that is 8,611 meters tall.","Mount Everest, at 8,849 meters, is about 238 meters taller than K2, which stands at 8,611 meters.","Many climbers attempt to reach the summit of Mount Everest."]$j$,2,$q$Only this choice compares the two heights and states the difference (8,849 − 8,611 = 238).$q$,$j${"1":"Gives only one height, so no comparison is made."}$j$,80),
('SAT','Reading and Writing','sat-conventions',1,$q$The team of researchers ______ published its findings last week.$q$,$q$Which choice completes the text so that it conforms to the conventions of Standard English?$q$,$j$["have","has","are","were"]$j$,1,$q$The subject is "team" (singular); "of researchers" is a prepositional phrase. Singular subject → "has." The singular pronoun "its" confirms it.$q$,$j${"0":"\"Have\" agrees with \"researchers,\" which is not the subject."}$j$,50),
('SAT','Reading and Writing','sat-conventions',2,$q$The museum's newest exhibit features work from three artists______ a painter, a sculptor, and a photographer.$q$,$q$Which choice completes the text so that it conforms to the conventions of Standard English?$q$,$j$[",",";",":","no punctuation"]$j$,2,$q$A colon can introduce a list that explains what came before it when the preceding part is a complete clause.$q$,$j${"1":"A semicolon must join two independent clauses; the list is not one."}$j$,60),
('SAT','Reading and Writing','sat-conventions',3,$q$Walking through the old library, ______$q$,$q$Which choice completes the text so that it conforms to the conventions of Standard English?$q$,$j$["the shelves seemed to stretch forever.","the dust made Jonah sneeze.","Jonah noticed that the shelves seemed to stretch forever.","there was a smell of old paper."]$j$,2,$q$The opening phrase describes someone walking, so the subject right after the comma must be the walker — Jonah. Other choices create dangling modifiers.$q$,$j${"0":"This says the shelves were walking.","1":"This says the dust was walking."}$j$,70),
('ACT','English','act-eng-conventions',1,$q$The company announced that ______ new headquarters will open in May.$q$,$q$Which choice is correct?$q$,$j$["it's","its","its'","their"]$j$,1,$q$"Its" is the possessive form. "It's" means "it is," and "its'" is never correct. "Their" is plural, but "company" is singular.$q$,$j${"0":"\"It's\" = \"it is\" — \"it is new headquarters\" doesn't make sense."}$j$,40),
('ACT','English','act-eng-conventions',2,$q$Rosa loves hiking, she goes every weekend.$q$,$q$Which choice best corrects the underlined portion "hiking, she"?$q$,$j$["NO CHANGE","hiking; she","hiking she","hiking, and, she"]$j$,1,$q$The original is a comma splice (two independent clauses joined by only a comma). A semicolon correctly joins them.$q$,$j${"2":"Removing the comma creates a run-on sentence."}$j$,45),
('ACT','English','act-eng-rhetoric',2,$q$The meeting will begin at 9 a.m. in the morning.$q$,$q$Which choice is the most concise replacement for "at 9 a.m. in the morning"?$q$,$j$["NO CHANGE","at 9 a.m.","at 9 a.m. early in the morning","at the time of 9 a.m. in the morning"]$j$,1,$q$"a.m." already means morning, so "in the morning" is redundant.$q$,$j${}$j$,40),
('ACT','English','act-eng-rhetoric',3,$q$[Paragraph about the history of bicycle design, from early wooden "hobby horses" to modern chain-driven frames.] The writer is considering adding the sentence: "My cousin owns a red bicycle."$q$,$q$Should the writer make this addition?$q$,$j$["Yes, because it gives a specific example of a bicycle.","Yes, because it adds a personal touch.","No, because it distracts from the paragraph's focus on the history of bicycle design.","No, because it contradicts information earlier in the paragraph."]$j$,2,$q$The paragraph is about design history; a personal detail about a cousin's bike is irrelevant to that focus.$q$,$j${"3":"It doesn't contradict anything — it's just off-topic."}$j$,60),
('ACT','Math','act-math-algebra',1,null,$q$If 5x − 3 = 2x + 9, what is the value of x?$q$,$j$["2","3","4","6"]$j$,2,$q$Subtract 2x: 3x − 3 = 9. Add 3: 3x = 12. So x = 4.$q$,$j${}$j$,50),
('ACT','Math','act-math-algebra',2,null,$q$What is the slope of the line that passes through (1, 2) and (4, 11)?$q$,$j$["1/3","3","9","13/5"]$j$,1,$q$Slope = (11 − 2)/(4 − 1) = 9/3 = 3.$q$,$j${"0":"1/3 is run over rise — slope is rise over run."}$j$,50),
('ACT','Math','act-math-geometry',1,null,$q$What is the perimeter of a rectangle with length 7 and width 4?$q$,$j$["11","22","28","14"]$j$,1,$q$Perimeter = 2(7 + 4) = 22.$q$,$j${"2":"28 is the area."}$j$,40),
('ACT','Math','act-math-geometry',3,null,$q$The measures of the angles of a triangle are in the ratio 2 : 3 : 4. What is the measure of the largest angle?$q$,$j$["40°","60°","80°","90°"]$j$,2,$q$The parts total 2 + 3 + 4 = 9, and the angles sum to 180°, so each part is 20°. The largest is 4 × 20° = 80°.$q$,$j${"0":"40° is the smallest angle."}$j$,70),
('ACT','Reading','act-reading-key-ideas',1,$q$When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.$q$,$q$According to the passage, what did Marisol's father do after the factory closed?$q$,$j$["He became an architect.","He drove a delivery truck.","He opened a restaurant.","He moved to another state."]$j$,1,$q$The first sentence states he "took a job driving a delivery truck."$q$,$j${"0":"He sketched buildings as a hobby; nothing says he became an architect."}$j$,60),
('ACT','Reading','act-reading-key-ideas',2,$q$When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.$q$,$q$The details in the last sentence most strongly suggest that the father:$q$,$j$["continued to value his drafting skills despite his new job.","planned to return to the factory soon.","disliked driving the delivery truck.","was designing a new home for the family."]$j$,0,$q$He keeps sketching on his own time, even when exhausted, which shows he still values drafting.$q$,$j${"2":"The passage never states his feelings about driving."}$j$,75),
('ACT','Reading','act-reading-craft',2,$q$When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.$q$,$q$The phrase "no one had asked him to design" mainly emphasizes that the sketches were:$q$,$j$["made for his own reasons rather than for pay or assignment.","rejected by his family.","poorly designed.","made for several clients."]$j$,0,$q$"No one had asked" means there was no client or assignment — he drew them for himself.$q$,$j${"3":"The phrase says the opposite: there were no clients."}$j$,70),
('ACT','Reading','act-reading-craft',3,$q$When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.$q$,$q$The word "Still" at the start of the last sentence signals:$q$,$j$["a cause-and-effect relationship.","a return to an earlier time.","agreement with a previous claim.","a contrast between his exhausting schedule and his continued sketching."]$j$,3,$q$"Still" here means "nevertheless": despite his tiring schedule, he kept sketching.$q$,$j${"0":"The schedule doesn't cause the sketching — it makes it surprising."}$j$,70),
('ACT','Science','act-sci-data',1,$q$Table 1: Dissolved oxygen in water at different temperatures
Temperature (°C): 10 | 20 | 30 | 40
Dissolved O₂ (mg/L): 11.3 | 9.1 | 7.6 | 6.4$q$,$q$According to Table 1, as temperature increases, dissolved oxygen:$q$,$j$["increases.","decreases.","stays the same.","increases, then decreases."]$j$,1,$q$Every increase in temperature is paired with a lower oxygen value: 11.3 → 9.1 → 7.6 → 6.4.$q$,$j${}$j$,45),
('ACT','Science','act-sci-data',2,$q$Table 1: Dissolved oxygen in water at different temperatures
Temperature (°C): 10 | 20 | 30 | 40
Dissolved O₂ (mg/L): 11.3 | 9.1 | 7.6 | 6.4$q$,$q$Based on Table 1, the dissolved oxygen at 25°C would most likely be:$q$,$j$["below 6.4 mg/L.","between 6.4 and 7.6 mg/L.","between 7.6 and 9.1 mg/L.","above 11.3 mg/L."]$j$,2,$q$25°C is between 20°C (9.1) and 30°C (7.6), so the value should fall between 7.6 and 9.1 mg/L.$q$,$j${"1":"That range corresponds to 30–40°C."}$j$,60),
('ACT','Science','act-sci-experiments',2,$q$A student tested how the amount of fertilizer affects plant height. She grew 4 groups of the same plant species in identical soil, with the same water and light, adding 0 g, 5 g, 10 g, or 15 g of fertilizer per week.$q$,$q$What is the independent variable in this experiment?$q$,$j$["Plant height","Amount of fertilizer","Amount of water","Amount of light"]$j$,1,$q$The independent variable is the factor the experimenter deliberately changes: fertilizer amount.$q$,$j${"0":"Plant height is measured — it's the dependent variable.","2":"Water was held constant."}$j$,50),
('ACT','Science','act-sci-experiments',3,$q$A student tested how the amount of fertilizer affects plant height. She grew 4 groups of the same plant species in identical soil, with the same water and light, adding 0 g, 5 g, 10 g, or 15 g of fertilizer per week.$q$,$q$What is the main purpose of the group that received 0 g of fertilizer?$q$,$j$["To increase the sample size of tall plants","To test the effect of light","To serve as a control for comparison","To change the soil type"]$j$,2,$q$The 0 g group shows how plants grow without fertilizer, giving a baseline to compare the other groups against.$q$,$j${}$j$,60);
