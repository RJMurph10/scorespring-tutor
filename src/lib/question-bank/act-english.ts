// Original ACT-style English passages. Each passage's questions stay together on tests.
// The underlined portion for each question is shown with __double underscores__.
import { englishSet, type Draft } from "./build";

const CV = "act-eng-conventions";
const RH = "act-eng-rhetoric";

const garden = englishSet(
  1,
  "Passage I — Reviving the Lot on Alder Street",
  `For years, the empty lot on Alder Street was {{1}} weeds, broken glass, and an abandoned shopping cart. Most neighbors walked past it without a second {{2}} aunt Rosa saw something different. She had grown up on a farm, and {{3}} imagined rows of tomatoes and beans where the trash now lay.

In the spring of 2019, Rosa {{4}} a meeting at the community center. Only six people came. {{5}} they left with a plan: they would ask the city for permission to use the lot, and they would clean it themselves.

The cleanup took three weekends. Volunteers hauled away {{6}} trash, tested the soil, and built twelve raised beds out of donated lumber. {{7}} the garden had a waiting list of families eager for a plot.

Today the garden {{8}} more than vegetables. Children learn where food comes from, older residents trade recipes, and neighbors who once {{9}} each other now share tools and advice. Rosa likes to say that the garden's best harvest {{10}} been friendship.`,
  {
    1: "a place that was full and crowded with",
    2: "glance, my",
    3: "they",
    4: "organizes",
    5: "Therefore,",
    6: "two hundred bags' of",
    7: "By the following summer,",
    8: "grow",
    9: "had barely known",
    10: "have",
  },
  [
    {
      at: 1,
      skill: RH,
      d: 1,
      c: ["full of", "NO CHANGE", "a location that contained within it", "filled up and full with"],
      e: '"Full of" says the same thing without the wordiness of the other choices.',
      n: { 1: "The original repeats the same idea (full, crowded) and adds unnecessary words." },
    },
    {
      at: 2,
      skill: CV,
      d: 2,
      c: ["glance. My", "NO CHANGE", "glance my", "glance, and, my"],
      e: '"Most neighbors walked past it without a second glance" and "My aunt Rosa saw something different" are complete sentences, so they must be separated by a period.',
      n: {
        1: "A comma alone between two complete sentences creates a comma splice.",
        2: "With no punctuation, this is a run-on sentence.",
      },
    },
    {
      at: 3,
      skill: CV,
      d: 1,
      c: ["she", "NO CHANGE", "her", "one"],
      e: 'The pronoun refers to Rosa, a single person who is the subject of the clause, so "she" is correct.',
      n: { 1: '"They" is plural, but it refers to Rosa.' },
    },
    {
      at: 4,
      skill: CV,
      d: 1,
      c: ["organized", "NO CHANGE", "has organized", "will organize"],
      e: 'The paragraph describes past events ("In the spring of 2019…Only six people came"), so the past tense "organized" is needed.',
    },
    {
      at: 5,
      skill: RH,
      d: 2,
      c: ["Even so,", "NO CHANGE", "For example,", "Similarly,"],
      e: 'Leaving with a plan despite low turnout is a contrast, so "Even so" is the logical transition.',
      n: { 1: "A plan isn't a result of only six people attending." },
    },
    {
      at: 6,
      skill: CV,
      d: 2,
      c: ["two hundred bags of", "NO CHANGE", "two hundred bag's of", "two hundred bags, of"],
      e: '"Bags" is a simple plural here; nothing is possessed, so no apostrophe is needed.',
    },
    {
      at: 7,
      skill: RH,
      d: 1,
      c: ["NO CHANGE", "In contrast,", "However,", "For instance,"],
      e: 'The paragraph moves forward in time from the cleanup to the garden\'s success, so the time transition "By the following summer" works best.',
    },
    {
      at: 8,
      skill: CV,
      d: 1,
      c: ["grows", "NO CHANGE", "are growing", "have grown"],
      e: 'The singular subject "garden" requires the singular verb "grows."',
    },
    {
      at: 9,
      skill: CV,
      d: 2,
      c: ["NO CHANGE", "barely had knew", "had barely knew", "barely knowed"],
      e: '"Had known" is the correct past perfect form; "knew" and "knowed" can\'t follow "had."',
    },
    {
      at: 10,
      skill: CV,
      d: 1,
      c: ["has", "NO CHANGE", "having", "were"],
      e: 'The singular subject "harvest" requires "has."',
    },
    {
      skill: RH,
      d: 2,
      q: "Suppose the writer's goal had been to write an essay explaining how community gardens improve a city's air quality. Would this essay accomplish that goal?",
      c: [
        "No, because it focuses on how one garden was created and how it brought neighbors together.",
        "Yes, because it describes how volunteers tested the soil.",
        "Yes, because it explains that the lot was once full of trash.",
        "No, because it argues that gardens shouldn't be built on empty lots.",
      ],
      e: "The essay is about one garden's creation and its effect on the community; air quality is never discussed.",
    },
    {
      skill: RH,
      d: 3,
      q: "The writer is considering adding the following sentence after the second paragraph's last sentence: \"Rosa's favorite vegetable has always been yellow squash.\" Should the writer make this addition?",
      c: [
        "No, because it distracts from the paragraph's focus on the group's plan for the lot.",
        "Yes, because it explains why Rosa wanted to start a garden.",
        "Yes, because it describes what was eventually planted in the garden.",
        "No, because it contradicts the statement that Rosa grew up on a farm.",
      ],
      e: "The paragraph is about the meeting and the plan; Rosa's favorite vegetable is an irrelevant detail.",
    },
  ],
);

const bookmobile = englishSet(
  2,
  "Passage II — Libraries on Wheels",
  `In the early twentieth century, many rural Americans lived miles from the nearest library. To reach them, some counties began sending libraries out on {{1}}. These "book wagons," later known as bookmobiles, were often converted carriages and, later, trucks lined with {{2}} shelves.

One of the earliest {{3}} in Washington County, Maryland, in 1905. {{4}} Mary Lemist Titcomb {{5}} a horse-drawn wagon that would carry books directly to farms and villages. {{6}} the wagon traveled routes through the countryside, stopping at general stores and farmhouses.

The service was popular, and families who had owned only a few books {{7}} borrow dozens each year. When the original wagon was destroyed in an accident, the county eventually {{8}} it with a motorized truck.

Bookmobiles spread across the country over the following decades. Today, though their numbers have declined, they still serve rural areas, schools, and senior centers, {{9}} people who cannot easily travel to a library.`,
  {
    1: "wheels",
    2: "sturdy, wooden,",
    3: "began operating",
    4: "A librarian, named",
    5: "thought of and came up with the idea of",
    6: "However,",
    7: "could suddenly",
    8: "replace",
    9: "reaching",
  },
  [
    {
      at: 1,
      skill: CV,
      d: 1,
      c: ["NO CHANGE", "wheel's", "wheels'", "wheels's"],
      e: '"Wheels" is a plural noun here, not a possessive, so no apostrophe is needed.',
    },
    {
      at: 2,
      skill: CV,
      d: 2,
      c: ["sturdy wooden", "NO CHANGE", "sturdy wooden,", "sturdy, and wooden"],
      e: '"Sturdy" and "wooden" aren\'t coordinate adjectives (you wouldn\'t say "wooden and sturdy shelves" naturally), so no comma separates them, and no comma belongs between an adjective and its noun.',
      n: { 2: "A comma shouldn't separate an adjective from the noun it modifies." },
    },
    {
      at: 3,
      skill: CV,
      d: 3,
      q: "Which choice is best for the underlined portion?",
      c: [
        "book wagons began operating",
        "NO CHANGE",
        "of these began operating, it was",
        "began operating it",
      ],
      e: 'As written, "One of the earliest began operating" has no noun after "earliest." Adding "book wagons" completes the subject.',
      n: { 1: '"One of the earliest" needs a noun to complete the subject.' },
    },
    {
      at: 4,
      skill: CV,
      d: 2,
      c: ["A librarian named", "NO CHANGE", "A librarian named,", "A librarian; named"],
      e: "The name identifies which librarian, so it is essential information and shouldn't be set off with commas.",
    },
    {
      at: 5,
      skill: RH,
      d: 1,
      c: [
        "proposed",
        "NO CHANGE",
        "thought up and proposed the idea of",
        "came up with and proposed",
      ],
      e: '"Proposed" expresses the idea concisely; the other choices are redundant.',
    },
    {
      at: 6,
      skill: RH,
      d: 2,
      c: ["Each week,", "NO CHANGE", "In contrast,", "Instead,"],
      e: 'The sentence describes the wagon\'s regular routine, not a contrast with the previous sentence, so "Each week" fits best.',
    },
    {
      at: 7,
      skill: CV,
      d: 2,
      c: ["NO CHANGE", "could of suddenly", "suddenly could of", "can suddenly"],
      e: '"Could suddenly" is correct. "Could of" is a mistake for "could have," and "can" shifts to the present tense.',
    },
    {
      at: 8,
      skill: CV,
      d: 1,
      c: ["replaced", "NO CHANGE", "replacing", "had replace"],
      e: 'The sentence describes a completed past action, so the past tense "replaced" is needed.',
    },
    {
      at: 9,
      skill: CV,
      d: 3,
      c: ["NO CHANGE", "they reach", "and reached", "reached"],
      e: '"Reaching people who…" correctly modifies the main clause. "They reach" creates a comma splice, and the past tense doesn\'t fit "Today."',
    },
    {
      skill: RH,
      d: 2,
      q: 'The writer is considering adding the following sentence after the first sentence of the last paragraph: "During the Great Depression, some librarians even delivered books on horseback through the mountains of Kentucky." Should the writer make this addition?',
      c: [
        "Yes, because it provides an example supporting the claim that mobile library service spread.",
        "Yes, because it explains why the Maryland wagon was destroyed.",
        "No, because it shifts the focus to the geography of Kentucky.",
        "No, because it contradicts the claim that bookmobiles still exist today.",
      ],
      e: "The paragraph says bookmobiles spread; a specific example of mobile library service elsewhere supports that claim.",
    },
    {
      skill: RH,
      d: 1,
      q: "Which choice best describes the main purpose of this essay?",
      c: [
        "To describe the origins and spread of mobile library service",
        "To argue that bookmobiles should replace public libraries",
        "To compare horse-drawn wagons with motor trucks",
        "To explain how library books are cataloged",
      ],
      e: "The essay traces mobile libraries from an early wagon to their spread and current use.",
    },
  ],
);

const cello = englishSet(
  3,
  "Passage III — The Long Notes",
  `I was eleven when I first picked up a cello. It was my {{1}}, a dented instrument she had played in her high school orchestra, and it smelled faintly of rosin and old wood. My first attempts {{2}} like a door creaking open in a horror movie.

My teacher, Mr. Okafor, {{3}} me to rush. For the first month, he had me play nothing but {{4}} on open strings. {{5}} I wanted to play real music, not exercises, and I told him so. He smiled and said, "The music is in the long notes."

It wasn't until my first recital, two years later, that I understood what he meant. As I played a simple melody, I noticed that every note was {{6}} the result of all those hours spent on open strings. {{7}} the audience, I felt for the first time that the cello and I were speaking the same language.

I still play every day. Before I practice anything else, I play long, slow notes, just as Mr. Okafor taught me — and each one {{8}} me of {{9}}`,
  {
    1: "mothers'",
    2: "sounded",
    3: "wouldn't never allow",
    4: "long notes that were slow and also long in their duration",
    5: "Therefore,",
    6: "steady, and full the",
    7: "Looking out at",
    8: "remind",
    9: "my favorite composers.",
  },
  [
    {
      at: 1,
      skill: CV,
      d: 1,
      c: ["mother's", "NO CHANGE", "mothers", "mothers's"],
      e: 'The cello belongs to one mother, so the singular possessive "mother\'s" is correct.',
    },
    {
      at: 2,
      skill: CV,
      d: 1,
      c: ["NO CHANGE", "sounding", "was sounding", "sounds"],
      e: 'The plural subject "attempts" needs a plural past-tense verb; "sounded" fits the narrative.',
      n: { 2: '"Was" is singular, but "attempts" is plural.' },
    },
    {
      at: 3,
      skill: CV,
      d: 2,
      c: ["would not allow", "NO CHANGE", "would not never allow", "not would allow"],
      e: '"Wouldn\'t never" is a double negative. "Would not allow" is correct.',
    },
    {
      at: 4,
      skill: RH,
      d: 1,
      c: [
        "long, slow notes",
        "NO CHANGE",
        "notes, long ones, that were slow",
        "long notes that were slow and long",
      ],
      e: '"Long, slow notes" is concise and clear; the other choices repeat "long."',
    },
    {
      at: 5,
      skill: RH,
      d: 2,
      c: ["At first,", "NO CHANGE", "As a result,", "In other words,"],
      e: 'The narrator\'s early impatience contrasts with the understanding that comes later, so "At first" sets up that shift. Nothing here is a result of the previous sentence.',
      n: { 1: "Wanting to play real music isn't a consequence of playing long notes." },
    },
    {
      at: 6,
      skill: CV,
      d: 2,
      c: ["steady and full, the", "NO CHANGE", "steady and full the", "steady, and full, the"],
      e: 'No comma belongs between the two adjectives joined by "and," but a comma is needed before the appositive phrase "the result of…"',
    },
    {
      at: 7,
      skill: CV,
      d: 3,
      c: ["NO CHANGE", "Looked out at", "Having look out at", "I looked out at"],
      e: '"Looking out at the audience" is a modifying phrase describing "I." "I looked out at the audience, I felt…" would be a comma splice.',
      n: { 3: "This creates two independent clauses joined only by a comma." },
    },
    {
      at: 8,
      skill: CV,
      d: 1,
      c: ["reminds", "NO CHANGE", "remind's", "are reminding"],
      e: '"Each one" is singular, so it takes the singular verb "reminds."',
    },
    {
      at: 9,
      skill: RH,
      d: 3,
      q: "Which choice most effectively concludes the essay by returning to the lesson the narrator learned from Mr. Okafor?",
      c: [
        "the patience it took to find the music in the long notes.",
        "NO CHANGE",
        "how nervous I was at my first recital.",
        "the need to buy a better instrument someday.",
      ],
      e: "The essay's central lesson is Mr. Okafor's line \"The music is in the long notes\"; this choice brings the ending back to it.",
    },
    {
      skill: RH,
      d: 2,
      q: "The writer is considering deleting the sentence \"He smiled and said, 'The music is in the long notes.'\" Should the sentence be kept or deleted?",
      c: [
        "Kept, because it introduces an idea the narrator comes to understand later in the essay.",
        "Deleted, because it repeats information from earlier in the paragraph.",
        "Deleted, because it distracts from the description of the recital.",
        "Kept, because it explains why the narrator's mother played the cello.",
      ],
      e: 'The next paragraph begins "It wasn\'t until my first recital…that I understood what he meant," which depends on this sentence.',
    },
    {
      skill: RH,
      d: 2,
      q: "Suppose the writer's goal had been to write an essay about how a teacher's advice took on meaning over time. Would this essay accomplish that goal?",
      c: [
        "Yes, because it shows the narrator coming to understand Mr. Okafor's advice years after hearing it.",
        "Yes, because it lists the pieces the narrator learned from Mr. Okafor.",
        "No, because it focuses mainly on the history of the cello.",
        "No, because the narrator never follows Mr. Okafor's advice.",
      ],
      e: "The narrator hears the advice, resists it, and understands it two years later — exactly that arc.",
    },
  ],
);

const monarchs = englishSet(
  4,
  "Passage IV — Helping the Monarchs",
  `Each fall, millions of monarch butterflies {{1}} from Canada and the northern United States to the mountains of central Mexico, {{2}} up to 3,000 miles. No single butterfly makes the entire round trip; it takes {{3}} for the population to return north.

{{4}} the eastern monarch population has declined sharply since the 1990s. Scientists point to {{5}}, including the loss of milkweed, the only plant on which monarch caterpillars can {{6}}. As farms and suburbs have expanded, milkweed {{7}} disappeared from much of the monarchs' range.

Volunteers across the continent are trying to help. Schools plant milkweed gardens, {{8}} highway departments let roadside plants grow instead of mowing them. Citizen scientists tag butterflies with small stickers, {{9}} researchers to track where individual monarchs travel.

Whether these efforts will be enough remains uncertain. But for many volunteers, the work is its own reward: few sights compare to a garden full of orange wings in late {{10}}`,
  {
    1: "migrates",
    2: "a journey, of",
    3: "several generation's",
    4: "Fortunately,",
    5: "several different multiple causes",
    6: "feed",
    7: "has",
    8: "and",
    9: "allowing",
    10: "summer?",
  },
  [
    {
      at: 1,
      skill: CV,
      d: 1,
      c: ["migrate", "NO CHANGE", "migrating", "has migrated"],
      e: 'The plural subject "butterflies" requires the plural verb "migrate."',
    },
    {
      at: 2,
      skill: CV,
      d: 2,
      c: ["a journey of", "NO CHANGE", "a journey of,", "a journey; of"],
      e: 'No punctuation should separate "journey" from the phrase "of up to 3,000 miles" that completes it.',
    },
    {
      at: 3,
      skill: CV,
      d: 1,
      c: ["several generations", "NO CHANGE", "several generations'", "several generation"],
      e: '"Generations" is a plural noun, not a possessive.',
    },
    {
      at: 4,
      skill: RH,
      d: 1,
      c: ["Unfortunately,", "NO CHANGE", "For example,", "Similarly,"],
      e: 'A sharp population decline is bad news, so "Unfortunately" fits.',
    },
    {
      at: 5,
      skill: RH,
      d: 1,
      c: ["several causes", "NO CHANGE", "many several causes", "a number of multiple causes"],
      e: '"Several," "different," and "multiple" all express the same idea; "several causes" is concise.',
    },
    {
      at: 6,
      skill: CV,
      d: 1,
      c: ["NO CHANGE", "feeds", "fed", "have fed"],
      e: 'After the helping verb "can," the base form "feed" is correct.',
    },
    {
      at: 7,
      skill: CV,
      d: 2,
      c: ["NO CHANGE", "have", "having", "were"],
      e: '"Milkweed" is singular, so "has disappeared" is correct.',
    },
    {
      at: 8,
      skill: CV,
      d: 2,
      c: ["NO CHANGE", "; and,", "and, also", "but"],
      e: 'A comma followed by "and" correctly joins the two independent clauses; "but" would wrongly signal a contrast.',
    },
    {
      at: 9,
      skill: CV,
      d: 3,
      c: ["NO CHANGE", "they allow", "allows", "allowed"],
      e: '"Allowing researchers…" modifies the whole clause. "They allow" creates a comma splice, and "allows"/"allowed" have no subject.',
      n: { 1: "Two independent clauses joined only by a comma form a comma splice." },
    },
    {
      at: 10,
      skill: CV,
      d: 1,
      c: ["summer.", "NO CHANGE", "summer!?", "summer,"],
      e: "The sentence is a statement, not a question, so it ends with a period.",
    },
    {
      skill: RH,
      d: 2,
      q: 'If the writer were to delete the sentence beginning "Citizen scientists tag butterflies," the paragraph would primarily lose:',
      c: [
        "an example of how volunteers contribute to research on monarchs.",
        "an explanation of why milkweed is declining.",
        "a description of the monarchs' migration route.",
        "evidence that the monarch population has fully recovered.",
      ],
      e: "The sentence gives a second example of volunteer help: tagging butterflies so researchers can track them.",
    },
    {
      skill: RH,
      d: 2,
      q: "Suppose the writer's goal had been to explain how people are responding to a decline in monarch butterflies. Would this essay accomplish that goal?",
      c: [
        "Yes, because it describes the decline and several ways volunteers are responding to it.",
        "Yes, because it proves that the monarch population has fully recovered.",
        "No, because it focuses only on the monarchs' migration route.",
        "No, because it doesn't mention any causes of the decline.",
      ],
      e: "The essay explains the decline and its causes and then describes volunteer responses.",
    },
  ],
);

export const ACT_ENGLISH: Draft[] = [...garden, ...bookmobile, ...cello, ...monarchs];
