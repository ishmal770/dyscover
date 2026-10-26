import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type Band = "k2" | "g35";
type Game = "parrotPairsGame" | "syllableSafariGame" | "monkeyMixUpGame" | "cheetahChallengeGame" | "lizardLookoutsGame" | "lionsLettersGame";
type Question = {
  id: string;
  game_type: Game;
  type: "word" | "vowel" | "choice";
  prompt: string;
  word: string;
  choices: string[];
  answer: string;
  template?: (string | null)[];
};
const GAMES: Game[] = [
  "parrotPairsGame", "syllableSafariGame", "monkeyMixUpGame",
  "cheetahChallengeGame", "lizardLookoutsGame", "lionsLettersGame",
];
const TITLES: Record<Game, string> = {
  parrotPairsGame: "Parrot Pairs",
  syllableSafariGame: "Syllable Safari",
  monkeyMixUpGame: "Monkey Mix-Up",
  cheetahChallengeGame: "Cheetah Challenge",
  lizardLookoutsGame: "Lizard Lookouts",
  lionsLettersGame: "Lion's Letters",
};
const QUESTIONS: Record<Band, Question[]> = {
  k2: [
    { id: "k2-parrot-cat", game_type: "parrotPairsGame", type: "word", prompt: "Listen, then tap the word you hear.", word: "cat", choices: ["cut", "cat", "cot"], answer: "cat" },
    { id: "k2-syllable-tiger", game_type: "syllableSafariGame", type: "choice", prompt: "How many word parts do you hear?", word: "tiger", choices: ["1", "2", "3"], answer: "2" },
    { id: "k2-monkey-vowel", game_type: "monkeyMixUpGame", type: "vowel", prompt: "Tap the missing vowel.", word: "sun", choices: ["A", "E", "I", "O", "U"], template: ["S", null, "N"], answer: "U" },
    { id: "k2-cheetah-dog", game_type: "cheetahChallengeGame", type: "word", prompt: "Listen, then tap the word you hear.", word: "dog", choices: ["dig", "dug", "dog"], answer: "dog" },
    { id: "k2-lizard-bat", game_type: "lizardLookoutsGame", type: "choice", prompt: "Tap the first letter in this word.", word: "bat", choices: ["b", "d", "p"], answer: "b" },
    { id: "k2-lion-sun", game_type: "lionsLettersGame", type: "choice", prompt: "Tap the first letter in this word.", word: "sun", choices: ["s", "m", "t"], answer: "s" },
  ],
  g35: [
    { id: "g35-parrot-angle", game_type: "parrotPairsGame", type: "word", prompt: "Listen, then tap the word you hear.", word: "angle", choices: ["angel", "angry", "angle"], answer: "angle" },
    { id: "g35-syllable-butterfly", game_type: "syllableSafariGame", type: "choice", prompt: "How many word parts do you hear?", word: "butterfly", choices: ["2", "3", "4"], answer: "3" },
    { id: "g35-monkey-vowel", game_type: "monkeyMixUpGame", type: "vowel", prompt: "Tap the missing vowel.", word: "frog", choices: ["A", "E", "I", "O", "U"], template: ["F", "R", null, "G"], answer: "O" },
    { id: "g35-cheetah-bridge", game_type: "cheetahChallengeGame", type: "word", prompt: "Listen, then tap the word you hear.", word: "bridge", choices: ["bridge", "bright", "bride"], answer: "bridge" },
    { id: "g35-lizard-drift", game_type: "lizardLookoutsGame", type: "choice", prompt: "Tap the first letter in this word.", word: "drift", choices: ["b", "d", "p"], answer: "d" },
    { id: "g35-lion-planet", game_type: "lionsLettersGame", type: "choice", prompt: "Tap the first letter in this word.", word: "planet", choices: ["p", "q", "b"], answer: "p" },
  ],
};
const QUESTION_COUNT = GAMES.length;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const masteryPercent = (rating: number) => Math.round(100 / (1 + Math.exp(-rating)));
const today = () => new Date().toISOString().slice(0, 10);

function publicQuestion(question: Question) {
  const { answer: _answer, ...safe } = question;
  return safe;
}

function evaluate(history: unknown, initialBand: Band) {
  if (!Array.isArray(history) || history.length > QUESTION_COUNT) throw new Error("Invalid answer history.");
  let band = initialBand;
  let correct = 0;
  const scored: Array<{ question: Question; right: boolean; duration: number; difficulty: number }> = [];
  for (let i = 0; i < history.length; i += 1) {
    const item = history[i];
    const question = QUESTIONS[band][i];
    if (!question || item?.question_id !== question.id || typeof item?.answer !== "string") {
      throw new Error("The diagnostic answers are out of order. Please restart.");
    }
    const right = item.answer === question.answer;
    const duration = Number(item.duration_ms);
    if (!Number.isInteger(duration) || duration < 0 || duration > 600000) throw new Error("Invalid answer time.");
    if (right) correct += 1;
    scored.push({ question, right, duration, difficulty: band === "k2" ? -1 : 1 });
    band = clamp((band === "k2" ? 0 : 1) + (right ? 1 : -1), 0, 1) === 0 ? "k2" : "g35";
  }
  return { band, correct, scored };
}

async function createInitialPlan(db, studentId: string, band: Band, ratings: Map<Game, number>) {
  const lowSkills = GAMES.filter((game) => ratings.get(game)! < 1)
    .sort((a, b) => ratings.get(a)! - ratings.get(b)!);
  const pool = lowSkills.length ? lowSkills : GAMES;
  const offset = Math.floor(Date.now() / 86400000) % pool.length;
  const selected = pool.map((_, i) => pool[(offset + i) % pool.length]).slice(0, 3);
  const items = selected.map((game, i) => ({
    game_type: game, title: TITLES[game], lesson_id: game,
    skill: TITLES[game], world: 1, target_minutes: 5,
    status: "pending", order: i + 1,
    reason: ratings.get(game)! < 0
      ? "Your diagnostic found this skill could use extra practice."
      : "Practice this skill to build a strong foundation.",
  }));
  const { error } = await db.from("daily_lesson_plans").upsert({
    student_id: studentId, plan_date: today(), world: 1, target_minutes: 15,
    status: "active", items,
  }, { onConflict: "student_id,plan_date" });
  if (error) throw error;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });
    const studentId = ctx.userClaims?.id;
    if (!studentId) return Response.json({ error: "Please sign in first." }, { status: 401 });

    try {
      const body = await req.json();
      const db = ctx.supabaseAdmin;

      if (body.action === "start") {
        const band: Band = body.grade_tier === "g35" ? "g35" : "k2";
        const { data: profile, error } = await db.from("profiles").select("id, diagnostic_completed").eq("id", studentId).single();
        if (error || !profile) throw new Error("Your student profile is not ready. Sign out and back in, then try again.");
        if (profile.diagnostic_completed) return Response.json({ error: "This diagnostic is already complete." }, { status: 409 });
        const { error: updateError } = await db.from("profiles").update({ grade_tier: band }).eq("id", studentId);
        if (updateError) throw updateError;
        return Response.json({ question: publicQuestion(QUESTIONS[band][0]), question_number: 1, total: QUESTION_COUNT });
      }

      if (body.action !== "answer") return Response.json({ error: "Unknown diagnostic action." }, { status: 400 });
      const { data: profile, error: profileError } = await db.from("profiles")
        .select("grade_tier, diagnostic_completed").eq("id", studentId).single();
      if (profileError || !profile) throw new Error("Student profile not found.");
      if (profile.diagnostic_completed) return Response.json({ error: "Diagnostic already complete." }, { status: 409 });
      const startBand: Band = profile.grade_tier === "g35" ? "g35" : "k2";
      const result = evaluate(body.history, startBand);

      if (result.scored.length < QUESTION_COUNT) {
        const nextQuestion = QUESTIONS[result.band][result.scored.length];
        if (!nextQuestion) throw new Error("No diagnostic question is available.");
        return Response.json({
          correct: result.scored.at(-1)?.right,
          question: publicQuestion(nextQuestion),
          question_number: result.scored.length + 1,
          total: QUESTION_COUNT,
          current_band: result.band,
        });
      }

      const ratingByGame = new Map<Game, number>();
      const sessionRows = result.scored.map(({ question, right, duration, difficulty }) => {
        const expected = 1 / (1 + Math.exp(-((0) - difficulty)));
        const rating = clamp(0 + 0.7 * (Number(right) - expected), -3, 3);
        ratingByGame.set(question.game_type, rating);
        return {
          student_id: studentId, game_type: question.game_type,
          question_id: null, accuracy: Number(right), completion_time_ms: duration,
          attempt_count: 1, error_type: right ? null : "placement_missed",
        };
      });
      const { error: sessionError } = await db.from("game_sessions").insert(sessionRows);
      if (sessionError) throw sessionError;

      const { error: skillError } = await db.from("student_skill_levels").upsert(
        [...ratingByGame.entries()].map(([game_type, skill_rating]) => ({
          student_id: studentId, game_type, skill_rating: Number(skill_rating.toFixed(2)),
          needs_intervention: skill_rating < 0,
          last_error_type: skill_rating < 0 ? "placement_missed" : null,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "student_id,game_type" },
      );
      if (skillError) throw skillError;

      const startLessonId = result.correct <= 2 ? "monkeyMixUpGame" : result.correct <= 4 ? "lizardLookoutsGame" : "syllableSafariGame";
      const { error: profileUpdateError } = await db.from("profiles").update({
        grade_tier: result.band, diagnostic_completed: true, current_world: 1,
        flagged_for_review: result.correct <= 2,
      }).eq("id", studentId);
      if (profileUpdateError) throw profileUpdateError;
      await createInitialPlan(db, studentId, result.band, ratingByGame);

      return Response.json({
        complete: true, correct: result.correct, total: QUESTION_COUNT,
        grade_tier: result.band, start_lesson_id: startLessonId,
        skills: [...ratingByGame.entries()].map(([game_type, rating]) => ({
          game_type, skill_rating: Number(rating.toFixed(2)), mastery_percent: masteryPercent(rating),
        })),
      });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Could not save the diagnostic." }, { status: 400 });
    }
  }),
};

