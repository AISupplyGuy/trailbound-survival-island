export type ResourceKey = "wood" | "stone" | "food" | "water" | "rope" | "metal" | "crystal";
export type ChallengeType = "choice" | "number" | "sequence";
export type Skill = "multiplication" | "division" | "fractions" | "measurement" | "patterns" | "reading" | "science" | "ecosystems" | "logic";

export type Challenge = {
  id: string;
  location: string;
  subject: "Math" | "Science" | "Reading" | "Logic";
  skill: Skill;
  difficulty: 1 | 2 | 3 | 4 | 5;
  gradeBand: string;
  type: ChallengeType;
  story: string;
  prompt: string;
  options?: string[];
  answer: string | string[];
  hints: [string, string];
  explanation: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  npc: "Scout" | "Maya" | "Professor Spark" | "Captain Finn";
  location: string;
  challengeIds: string[];
  reward: Partial<Record<ResourceKey, number>> & { xp: number; coins: number };
  unlocks: string[];
};

export type Item = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: "Common" | "Uncommon" | "Rare";
  cost: Partial<Record<ResourceKey, number>>;
};

export type LearningStat = { attempts: number; correct: number; mastery: number };
