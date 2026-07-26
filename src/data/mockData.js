// All data in this file is fake/illustrative - there is no backend yet.

export const GAME_TROPHIES = [
  {
    world: "World 1: Jungle Games",
    games: [
      { name: "Parrot Pairs", routeKey: "parrotPairsGame", skill: "Visual Discrimination", stars: 3, mastered: true },
      { name: "Syllable Safari", routeKey: "syllableSafariGame", skill: "Phonics", stars: 2, mastered: false },
      { name: "Monkey Mix-Up", routeKey: "monkeyMixUpGame", skill: "Phonics", stars: 3, mastered: true },
    ],
  },
  {
    world: "World 2: Canopy Quest",
    games: [
      { name: "Lion's Letters", routeKey: "lionsLettersGame", skill: "Memory", stars: 1, mastered: false },
      { name: "Lizard Lookouts", routeKey: "lizardLookoutsGame", skill: "Visual Discrimination", stars: 2, mastered: false },
      { name: "Cheetah Challenge", routeKey: "cheetahChallengeGame", skill: "Reading Speed", stars: 3, mastered: true },
    ],
  },
];

export const SKILL_FILTERS = ["All", "Visual Discrimination", "Phonics", "Reading Speed", "Memory"];

const accuracyTrendTemplate = (start) =>
  ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map((week, i) => ({
    week,
    accuracy: Math.min(98, start + i * 3 + (i % 2 === 0 ? 2 : -1)),
  }));

export const STUDENTS = [
  {
    id: "leo-carter",
    name: "Leo Carter",
    grade: "3rd Grade",
    lastActive: "Today, 10:45 AM",
    overallMastery: 78,
    skills: [
      { skill: "Visual Discrimination", score: 85 },
      { skill: "Syllable Breaking", score: 74 },
      { skill: "Rapid Naming", score: 65 },
      { skill: "Vowel Blends", score: 40 },
      { skill: "Auditory Processing", score: 88 },
    ],
    curriculumProgress: [
      { world: "Lizard Lookouts", percent: 85 },
      { world: "Parrot Pairs", percent: 82 },
      { world: "Syllable Safari", percent: 78 },
      { world: "Cheetah Challenge", percent: 55 },
    ],
    accuracyTrend: accuracyTrendTemplate(70),
    sessions: [
      { date: "Oct 24, 2026, 09:15 AM", activity: "Parrot Pairs L4", duration: "15m", accuracy: 68, observation: "Struggled slightly with 'r' blends. Reported eye strain toward the end." },
      { date: "Oct 23, 2026, 02:30 PM", activity: "Cheetah Challenge L3", duration: "12m", accuracy: 74, observation: "Fatigue reduced reading speed towards the end of session." },
      { date: "Oct 21, 2026, 10:09 AM", activity: "Lizard Lookouts L3", duration: "20m", accuracy: 85, observation: "Excellent visual tracking training. Consistent focus." },
      { date: "Oct 18, 2026, 11:15 AM", activity: "Syllable Safari L3", duration: "18m", accuracy: 72, observation: "Slow mapping between visual and phonemic content." },
      { date: "Oct 16, 2026, 09:45 AM", activity: "Parrot Pairs L3", duration: "9m", accuracy: 90, observation: "Solid performance. Ready to progress to L4." },
    ],
    recentActivity: [
      { label: "Mastered 'Parrot Pairs' module", time: "Today, 10:45 AM", type: "mastered" },
      { label: "Played 'Lizard Lookouts'", time: "Today, 10:15 AM", type: "played" },
      { label: "Completed Weekly Check-in", time: "Yesterday, 3:06 PM", type: "completed" },
      { label: "Struggled with 'Monkey Mix-Up'", time: "Yesterday, 2:47 PM", type: "struggled" },
    ],
    aiNote: "Leo seemed fatigued in Cheetah Challenge. Recommend assigning a focused short-burst practice session.",
  },
  {
    id: "mia-santos",
    name: "Mia Santos",
    grade: "3rd Grade",
    lastActive: "Yesterday, 4:20 PM",
    overallMastery: 65,
    skills: [
      { skill: "Visual Discrimination", score: 60 },
      { skill: "Syllable Breaking", score: 68 },
      { skill: "Rapid Naming", score: 55 },
      { skill: "Vowel Blends", score: 70 },
      { skill: "Auditory Processing", score: 62 },
    ],
    curriculumProgress: [
      { world: "Lizard Lookouts", percent: 60 },
      { world: "Parrot Pairs", percent: 70 },
      { world: "Syllable Safari", percent: 58 },
      { world: "Cheetah Challenge", percent: 45 },
    ],
    accuracyTrend: accuracyTrendTemplate(55),
    sessions: [
      { date: "Oct 24, 2026, 04:20 PM", activity: "Lizard Lookouts L2", duration: "14m", accuracy: 60, observation: "Needs more repetition on b/d discrimination." },
      { date: "Oct 22, 2026, 01:10 PM", activity: "Parrot Pairs L2", duration: "11m", accuracy: 71, observation: "Good improvement from last session." },
    ],
    recentActivity: [
      { label: "Played 'Lizard Lookouts'", time: "Yesterday, 4:20 PM", type: "played" },
      { label: "Struggled with 'Parrot Pairs'", time: "Yesterday, 3:55 PM", type: "struggled" },
    ],
    aiNote: "Mia benefits from shorter, more frequent sessions rather than long single sessions.",
  },
  {
    id: "noah-chen",
    name: "Noah Chen",
    grade: "4th Grade",
    lastActive: "Today, 9:30 AM",
    overallMastery: 82,
    skills: [
      { skill: "Visual Discrimination", score: 88 },
      { skill: "Syllable Breaking", score: 80 },
      { skill: "Rapid Naming", score: 84 },
      { skill: "Vowel Blends", score: 79 },
      { skill: "Auditory Processing", score: 81 },
    ],
    curriculumProgress: [
      { world: "Lizard Lookouts", percent: 90 },
      { world: "Parrot Pairs", percent: 84 },
      { world: "Syllable Safari", percent: 80 },
      { world: "Cheetah Challenge", percent: 76 },
    ],
    accuracyTrend: accuracyTrendTemplate(78),
    sessions: [
      { date: "Oct 24, 2026, 09:30 AM", activity: "Cheetah Challenge L5", duration: "10m", accuracy: 88, observation: "Consistently strong performance across all modules." },
    ],
    recentActivity: [
      { label: "Mastered 'Lizard Lookouts'", time: "Today, 9:30 AM", type: "mastered" },
    ],
    aiNote: "Noah is ready to progress to more advanced curriculum levels.",
  },
  {
    id: "emma-davis",
    name: "Emma Davis",
    grade: "2nd Grade",
    lastActive: "Today, 8:00 AM",
    overallMastery: 91,
    skills: [
      { skill: "Visual Discrimination", score: 93 },
      { skill: "Syllable Breaking", score: 90 },
      { skill: "Rapid Naming", score: 89 },
      { skill: "Vowel Blends", score: 92 },
      { skill: "Auditory Processing", score: 91 },
    ],
    curriculumProgress: [
      { world: "Lizard Lookouts", percent: 95 },
      { world: "Parrot Pairs", percent: 92 },
      { world: "Syllable Safari", percent: 90 },
      { world: "Cheetah Challenge", percent: 88 },
    ],
    accuracyTrend: accuracyTrendTemplate(85),
    sessions: [
      { date: "Oct 24, 2026, 08:00 AM", activity: "Syllable Safari L6", duration: "13m", accuracy: 94, observation: "Top of cohort performance. Consider enrichment content." },
    ],
    recentActivity: [
      { label: "Mastered 'Monkey Mix-Up'", time: "Today, 8:00 AM", type: "mastered" },
    ],
    aiNote: "Emma is exceeding grade-level targets across every skill area.",
  },
];

export function getAggregateMetrics() {
  const totalStudents = STUDENTS.length * 321; // illustrative scale-up, not a real count
  const avgAccuracy =
    STUDENTS.reduce((sum, s) => sum + s.skills.reduce((a, b) => a + b.score, 0) / s.skills.length, 0) /
    STUDENTS.length;
  return {
    totalStudents,
    avgAccuracy: avgAccuracy.toFixed(1),
    avgTimePerCase: "14m 20s",
    certifications: 452,
  };
}

export function getAggregateAccuracyTrend() {
  return accuracyTrendTemplate(72);
}

export function getAggregateSkillBreakdown() {
  const skillNames = STUDENTS[0].skills.map((s) => s.skill);
  return skillNames.map((skill) => {
    const avg =
      STUDENTS.reduce((sum, s) => sum + (s.skills.find((sk) => sk.skill === skill)?.score ?? 0), 0) /
      STUDENTS.length;
    return { skill, score: Math.round(avg) };
  });
}
