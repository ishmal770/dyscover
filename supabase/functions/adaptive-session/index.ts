import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const GAMES = {
  parrotPairsGame: { title: "Parrot Pairs", skill: "Letter order" },
  syllableSafariGame: { title: "Syllable Safari", skill: "Syllables" },
  monkeyMixUpGame: { title: "Monkey Mix-Up", skill: "Vowel sounds" },
  cheetahChallengeGame: { title: "Cheetah Challenge", skill: "Reading speed" },
  lizardLookoutsGame: { title: "Lizard Lookouts", skill: "Letter recognition" },
  lionsLettersGame: { title: "Lion's Letters", skill: "Handwriting" },
};
const GAME_IDS = Object.keys(GAMES);
const EXPERT_ROLES = ["teacher", "therapist", "parent"];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const today = () => new Date().toISOString().slice(0, 10);
const masteryPercent = (rating) => Math.round(100 / (1 + Math.exp(-Number(rating))));

async function requireProfile(db, userId) {
  const { data, error } = await db
    .from("profiles")
    .select("id, full_name, role, grade_tier, current_world, diagnostic_completed, flagged_for_review")
    .eq("id", userId)
    .single();
  if (error || !data) throw new Error("Your profile is not ready yet. Sign out and back in, then try again.");
  return data;
}

async function ensureDailyPlan(db, studentId, profile) {
  const planDate = today();
  const world = Math.max(1, Number(profile.current_world || 1));
  const { data: current } = await db
    .from("daily_lesson_plans")
    .select("*")
    .eq("student_id", studentId)
    .eq("plan_date", planDate)
    .maybeSingle();
  if (current && Number(current.world) >= world) return current;

  const { data: skills } = await db
    .from("student_skill_levels")
    .select("game_type, skill_rating, needs_intervention")
    .eq("student_id", studentId);
  const { data: feedback } = await db
    .from("expert_feedback")
    .select("focus_skill, focus_until")
    .eq("student_id", studentId)
    .not("focus_skill", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeFocus = feedback?.focus_until && new Date(feedback.focus_until) > new Date()
    ? feedback.focus_skill
    : null;
  const ratingByGame = new Map((skills || []).map((item) => [item.game_type, Number(item.skill_rating)]));
  const dayNumber = Math.floor(Date.now() / 86400000);
  const ranked = [...GAME_IDS].sort((a, b) => {
    if (a === activeFocus) return -1;
    if (b === activeFocus) return 1;
    return (ratingByGame.get(a) ?? -1) - (ratingByGame.get(b) ?? -1);
  });
  const deficient = ranked.filter((game) => (ratingByGame.get(game) ?? -1) < 1);
  const rotationPool = deficient.length ? deficient : ranked;
  const rotationStart = activeFocus ? 0 : dayNumber % rotationPool.length;
  const rotated = rotationPool.map((_, i) => rotationPool[(rotationStart + i) % rotationPool.length]);
  const chosen = rotated.slice(0, Math.min(3, rotated.length));
  const newItems = chosen.map((gameType, index) => ({
    game_type: gameType,
    title: GAMES[gameType].title,
    skill: GAMES[gameType].skill,
    lesson_id: gameType,
    world,
    target_minutes: 5,
    status: "pending",
    reason: activeFocus === gameType ? "Focus set by your learning expert." :
      (ratingByGame.get(gameType) ?? -1) < 0 ? "Extra practice for a skill that needs support." : "Keep this skill growing.",
    order: index + 1,
  }));

  const items = current
    ? [...(current.items || []), ...newItems.filter((item) => !(current.items || []).some((old) => old.game_type === item.game_type && old.status !== "completed"))]
    : newItems;
  const appended = current ? items.length - (current.items || []).length : 0;
  const { data: created, error } = await db
    .from("daily_lesson_plans")
    .upsert({
      student_id: studentId,
      plan_date: planDate,
      world,
      target_minutes: Math.min(20, current ? Number(current.target_minutes || 15) + appended * 5 : 15),
      status: "active",
      items,
    }, { onConflict: "student_id,plan_date" })
    .select("*")
    .single();
  if (error) throw error;
  return created;
}

async function pickRecommendation(db, studentId, profile, plan) {
  const { data: skills } = await db
    .from("student_skill_levels")
    .select("game_type, skill_rating, needs_intervention")
    .eq("student_id", studentId);
  const feedbackResult = await db
    .from("expert_feedback")
    .select("focus_skill, focus_until")
    .eq("student_id", studentId)
    .not("focus_skill", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const feedback = feedbackResult.data;
  const forcedFocus = feedback?.focus_until && new Date(feedback.focus_until) > new Date()
    ? feedback.focus_skill
    : null;
  const pending = (plan.items || []).filter((item) => item.status !== "completed");
  const top = pending[0]?.game_type || forcedFocus ||
    [...(skills || [])].sort((a, b) => Number(a.skill_rating) - Number(b.skill_rating))[0]?.game_type ||
    "monkeyMixUpGame";
  const rating = Number((skills || []).find((item) => item.game_type === top)?.skill_rating ?? 0);
  const { data: candidates } = await db
    .from("diagnostic_questions")
    .select("id, game_type, difficulty, world")
    .eq("game_type", top)
    .eq("grade_tier", profile.grade_tier)
    .lte("world", Math.max(1, Number(profile.current_world || 1)))
    .limit(100);
  const available = candidates || [];
  let question = null;
  let explore = false;
  if (available.length) {
    explore = Math.random() < 0.2;
    question = explore
      ? available[Math.floor(Math.random() * available.length)]
      : [...available].sort((a, b) =>
          Math.abs(Number(a.difficulty) - rating) - Math.abs(Number(b.difficulty) - rating)
        )[0];
  }
  return {
    game_type: top,
    title: GAMES[top]?.title || top,
    skill: GAMES[top]?.skill || top,
    question_id: question?.id ?? null,
    difficulty: question?.difficulty ?? null,
    selection: forcedFocus === top ? "expert_focus" : question ? "adaptive_irt" : "local_game_bank",
    explore,
  };
}

async function worldProgression(db, studentId, profile) {
  if (Number(profile.current_world || 1) >= 2) return profile.current_world;
  const { data: skills, error } = await db
    .from("student_skill_levels")
    .select("game_type, skill_rating")
    .eq("student_id", studentId);
  if (error) return profile.current_world;
  const byGame = new Map((skills || []).map((row) => [row.game_type, Number(row.skill_rating)]));
  const mastered = GAME_IDS.every((game) => byGame.has(game) && byGame.get(game) >= 1);
  if (!mastered) return profile.current_world || 1;
  const { data: sessions } = await db.from("game_sessions")
    .select("game_type, accuracy")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(300);
  const enoughPractice = GAME_IDS.every((game) => {
    const recent = (sessions || []).filter((row) => row.game_type === game).slice(0, 3);
    return recent.length >= 3 && recent.reduce((sum, row) => sum + Number(row.accuracy), 0) / recent.length >= 0.75;
  });
  if (!enoughPractice) return profile.current_world || 1;
  const { error: updateError } = await db.from("profiles").update({ current_world: 2 }).eq("id", studentId);
  if (!updateError) return 2;
  return profile.current_world || 1;
}

async function updatePlanAfterSession(db, studentId, gameType) {
  const { data: plan } = await db.from("daily_lesson_plans")
    .select("items")
    .eq("student_id", studentId)
    .eq("plan_date", today())
    .maybeSingle();
  if (!plan || !Array.isArray(plan.items)) return;
  let marked = false;
  const items = plan.items.map((item) => {
    if (!marked && item.game_type === gameType && item.status !== "completed") {
      marked = true;
      return { ...item, status: "completed" };
    }
    return item;
  });
  const status = items.every((item) => item.status === "completed") ? "completed" : "active";
  await db.from("daily_lesson_plans")
    .update({ items, status })
    .eq("student_id", studentId)
    .eq("plan_date", today());
}

async function studentDashboard(db, studentId) {
  const profile = await requireProfile(db, studentId);
  const plan = profile.diagnostic_completed ? await ensureDailyPlan(db, studentId, profile) : null;
  const [skillsResult, sessionsResult, feedbackResult] = await Promise.all([
    db.from("student_skill_levels").select("*").eq("student_id", studentId),
    db.from("game_sessions").select("id, game_type, accuracy, completion_time_ms, attempt_count, error_type, created_at")
      .eq("student_id", studentId).order("created_at", { ascending: false }).limit(100),
    db.from("expert_feedback").select("notes, focus_skill, focus_until, created_at")
      .eq("student_id", studentId).order("created_at", { ascending: false }).limit(10),
  ]);
  if (skillsResult.error) throw skillsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  return {
    profile,
    plan,
    skills: (skillsResult.data || []).map((row) => ({ ...row, mastery_percent: masteryPercent(row.skill_rating) })),
    sessions: sessionsResult.data || [],
    expert_feedback: feedbackResult.data || [],
  };
}

async function expertDashboard(db, expertId, targetStudentId) {
  const expert = await requireProfile(db, expertId);
  if (!EXPERT_ROLES.includes(expert.role)) throw new Error("This account is not set up as a teacher, therapist, or parent.");
  const { data: assignments, error: assignmentError } = await db
    .from("expert_students")
    .select("student_id")
    .eq("expert_id", expertId);
  if (assignmentError) throw assignmentError;
  let studentIds = [...new Set((assignments || []).map((row) => row.student_id))];
  if (targetStudentId) {
    if (!studentIds.includes(targetStudentId)) throw new Error("You can only view students assigned to your account.");
    studentIds = [targetStudentId];
  }
  if (!studentIds.length) return { students: [], selected: null };

  const [profilesResult, skillsResult, sessionsResult, plansResult, feedbackResult, summariesResult, errorsResult] = await Promise.all([
    db.from("profiles").select("id, full_name, grade_tier, current_world, diagnostic_completed, flagged_for_review").in("id", studentIds),
    db.from("student_skill_levels").select("student_id, game_type, skill_rating, needs_intervention, last_error_type, updated_at").in("student_id", studentIds),
    db.from("game_sessions").select("id, student_id, game_type, accuracy, completion_time_ms, attempt_count, error_type, created_at").in("student_id", studentIds).order("created_at", { ascending: false }).limit(400),
    db.from("daily_lesson_plans").select("student_id, plan_date, target_minutes, status, items, world").in("student_id", studentIds).order("plan_date", { ascending: false }).limit(100),
    db.from("expert_feedback").select("id, expert_id, student_id, notes, focus_skill, focus_until, created_at").in("student_id", studentIds).order("created_at", { ascending: false }).limit(100),
    db.from("student_game_summary").select("student_id, game_type, sessions, avg_accuracy, avg_time_ms, accuracy_stddev, last_session_at").in("student_id", studentIds),
    db.from("student_error_summary").select("student_id, game_type, error_type, occurrences").in("student_id", studentIds),
  ]);
  for (const result of [profilesResult, skillsResult, sessionsResult, plansResult, feedbackResult, summariesResult, errorsResult]) {
    if (result.error) throw result.error;
  }
  const students = (profilesResult.data || []).map((profile) => ({
    ...profile,
    skills: (skillsResult.data || []).filter((row) => row.student_id === profile.id)
      .map((row) => ({ ...row, mastery_percent: masteryPercent(row.skill_rating) })),
    sessions: (sessionsResult.data || []).filter((row) => row.student_id === profile.id),
    plans: (plansResult.data || []).filter((row) => row.student_id === profile.id),
    feedback: (feedbackResult.data || []).filter((row) => row.student_id === profile.id),
    summaries: (summariesResult.data || []).filter((row) => row.student_id === profile.id),
    errors: (errorsResult.data || []).filter((row) => row.student_id === profile.id),
  }));
  return { students, selected: targetStudentId ? students.find((student) => student.id === targetStudentId) : null };
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "Use POST." }, { status: 405 });
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({ error: "Please sign in first." }, { status: 401 });
    const db = ctx.supabaseAdmin;

    try {
      const body = await req.json();
      const profile = await requireProfile(db, userId);

      if (body.action === "student_dashboard" || body.action === "daily_plan" || body.action === "next_content") {
        if (body.action === "daily_plan" && !profile.diagnostic_completed) {
          return Response.json({ error: "Complete the placement diagnostic to get a daily plan." }, { status: 409 });
        }
        const dashboard = await studentDashboard(db, userId);
        const recommendation = dashboard.plan
          ? await pickRecommendation(db, userId, dashboard.profile, dashboard.plan)
          : null;
        return Response.json({ ...dashboard, recommendation });
      }

      if (body.action === "record_session") {
        const gameType = body.game_type;
        const accuracy = Number(body.accuracy);
        const duration = Number(body.completion_time_ms);
        const attempts = Number(body.attempt_count ?? 1);
        const errorType = typeof body.error_type === "string" ? body.error_type.slice(0, 80) : null;
        if (!GAME_IDS.includes(gameType) || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 1 ||
          !Number.isInteger(duration) || duration < 0 || !Number.isInteger(attempts) || attempts < 1) {
          return Response.json({ error: "The game result is invalid." }, { status: 400 });
        }
        if (!profile.diagnostic_completed) return Response.json({ error: "Complete the placement diagnostic first." }, { status: 409 });

        let difficulty = 0;
        if (body.question_id != null) {
          const { data: question } = await db.from("diagnostic_questions")
            .select("id, game_type, difficulty, grade_tier, world")
            .eq("id", Number(body.question_id)).eq("game_type", gameType)
            .eq("grade_tier", profile.grade_tier).lte("world", profile.current_world || 1).maybeSingle();
          if (!question) return Response.json({ error: "That question is not available for this student." }, { status: 400 });
          difficulty = Number(question.difficulty);
        }
        const { data: previous } = await db.from("student_skill_levels").select("skill_rating")
          .eq("student_id", userId).eq("game_type", gameType).maybeSingle();
        const oldRating = Number(previous?.skill_rating ?? 0);
        const expected = 1 / (1 + Math.exp(-(oldRating - difficulty)));
        const updatedRating = clamp(oldRating + 0.7 * (accuracy - expected), -3, 3);
        const { error: sessionError } = await db.from("game_sessions").insert({
          student_id: userId, game_type: gameType,
          question_id: body.question_id == null ? null : Number(body.question_id),
          accuracy, completion_time_ms: duration, attempt_count: attempts, error_type: errorType,
        });
        if (sessionError) throw sessionError;
        const { error: skillError } = await db.from("student_skill_levels").upsert({
          student_id: userId, game_type: gameType, skill_rating: Number(updatedRating.toFixed(2)),
          needs_intervention: updatedRating < -0.5, last_error_type: errorType, updated_at: new Date().toISOString(),
        }, { onConflict: "student_id,game_type" });
        if (skillError) throw skillError;

        const { data: recent } = await db.from("game_sessions").select("accuracy")
          .eq("student_id", userId).eq("game_type", gameType)
          .order("created_at", { ascending: false }).limit(3);
        if ((recent || []).length === 3 && recent.every((row) => Number(row.accuracy) < 0.5)) {
          await db.from("profiles").update({ flagged_for_review: true }).eq("id", userId);
        }

        await updatePlanAfterSession(db, userId, gameType);
        const world = await worldProgression(db, userId, profile);
        const refreshedProfile = { ...profile, current_world: world };
        const plan = await ensureDailyPlan(db, userId, refreshedProfile);
        const recommendation = await pickRecommendation(db, userId, refreshedProfile, plan);
        return Response.json({
          saved: true, skill_rating: Number(updatedRating.toFixed(2)),
          mastery_percent: masteryPercent(updatedRating), needs_intervention: updatedRating < -0.5,
          current_world: world, recommendation, daily_plan: plan,
        });
      }

      if (body.action === "expert_dashboard") {
        const result = await expertDashboard(db, userId, typeof body.student_id === "string" ? body.student_id : null);
        return Response.json(result);
      }

      if (body.action === "expert_feedback") {
        if (!EXPERT_ROLES.includes(profile.role)) return Response.json({ error: "This account is not an expert account." }, { status: 403 });
        const studentId = body.student_id;
        const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : "";
        const focus = GAME_IDS.includes(body.focus_skill) ? body.focus_skill : null;
        if (typeof studentId !== "string" || !notes) return Response.json({ error: "Choose an assigned student and enter a note." }, { status: 400 });
        const { data: assignment } = await db.from("expert_students").select("student_id")
          .eq("expert_id", userId).eq("student_id", studentId).maybeSingle();
        if (!assignment) return Response.json({ error: "That student is not assigned to you." }, { status: 403 });
        const until = focus ? new Date(Date.now() + 7 * 86400000).toISOString() : null;
        const { error } = await db.from("expert_feedback").insert({
          expert_id: userId, student_id: studentId, notes,
          focus_skill: focus, focus_level: focus ? 2 : null, focus_until: until,
        });
        if (error) throw error;

        if (focus) {
          const { data: plan } = await db.from("daily_lesson_plans").select("items")
            .eq("student_id", studentId).eq("plan_date", today()).maybeSingle();
          if (plan && Array.isArray(plan.items)) {
            const remainder = plan.items.filter((item) => item.game_type !== focus);
            const existing = plan.items.find((item) => item.game_type === focus);
            const focusItem = existing
              ? { ...existing, status: "pending", reason: "Priority practice assigned by your learning expert." }
              : { game_type: focus, title: GAMES[focus].title, skill: GAMES[focus].skill,
                  lesson_id: focus, world: profile.current_world || 1, target_minutes: 5,
                  status: "pending", reason: "Priority practice assigned by your learning expert.", order: 1 };
            const reordered = [focusItem, ...remainder];
            await db.from("daily_lesson_plans").update({ items: reordered, status: "active" })
              .eq("student_id", studentId).eq("plan_date", today());
          }
        }
        return Response.json({ saved: true, focus_skill: focus, focus_until: until });
      }

      return Response.json({ error: "Unknown adaptive learning action." }, { status: 400 });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "The learning service could not complete this request." }, { status: 500 });
    }
  }),
};

