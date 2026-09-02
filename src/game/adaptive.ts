import { challenges } from "@/game-data/content";
import { Challenge, LearningStat, Quest, Skill } from "@/game/types";

export function updateMastery(previous: LearningStat | undefined, correct: boolean): LearningStat {
  const current = previous ?? { attempts: 0, correct: 0, mastery: 0.42 };
  const pLearn = 0.12;
  const pGuess = 0.2;
  const pSlip = 0.1;
  const observed = correct
    ? (current.mastery * (1 - pSlip)) / (current.mastery * (1 - pSlip) + (1 - current.mastery) * pGuess)
    : (current.mastery * pSlip) / (current.mastery * pSlip + (1 - current.mastery) * (1 - pGuess));

  return {
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    mastery: Math.min(0.98, observed + (1 - observed) * pLearn),
  };
}

export function selectChallenge(quest: Quest, stats: Partial<Record<Skill, LearningStat>>, grade: number): Challenge {
  const pool = challenges.filter((challenge) => quest.challengeIds.includes(challenge.id));
  const average = pool.reduce((sum, challenge) => sum + (stats[challenge.skill]?.mastery ?? 0.42), 0) / Math.max(pool.length, 1);
  const gradeNudge = grade >= 6 ? 0.45 : grade <= 3 ? -0.35 : 0;
  const target = Math.max(1, Math.min(5, Math.round(1 + average * 3 + gradeNudge)));
  return [...pool].sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target))[0];
}

export function masteryLabel(value: number) {
  if (value >= 0.82) return "Trailblazing";
  if (value >= 0.62) return "Growing strong";
  if (value >= 0.42) return "Finding the path";
  return "Needs a hand";
}
