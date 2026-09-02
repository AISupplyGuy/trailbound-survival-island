"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyResources, items, quests } from "@/game-data/content";
import { Challenge, LearningStat, ResourceKey, Skill } from "@/game/types";
import { updateMastery } from "@/game/adaptive";

type Stage = "landing" | "profile" | "intro" | "game";

type GameState = {
  stage: Stage;
  nickname: string;
  avatar: string;
  grade: number;
  xp: number;
  coins: number;
  resources: Record<ResourceKey, number>;
  crafted: string[];
  completedQuests: string[];
  unlockedLocations: string[];
  campLevel: number;
  learningStats: Partial<Record<Skill, LearningStat>>;
  totalAttempts: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  soundOn: boolean;
  setStage: (stage: Stage) => void;
  createExplorer: (nickname: string, avatar: string, grade: number) => void;
  recordAttempt: (challenge: Challenge, correct: boolean) => void;
  completeQuest: (questId: string) => boolean;
  craft: (itemId: string) => boolean;
  upgradeCamp: () => boolean;
  toggleSound: () => void;
  reset: () => void;
};

const campCosts: Array<Partial<Record<ResourceKey, number>>> = [
  { wood: 18 }, { wood: 16, stone: 6 }, { wood: 18, rope: 3 }, { wood: 22, stone: 10 }, { metal: 8, crystal: 3 },
];

const initial = {
  stage: "landing" as Stage,
  nickname: "",
  avatar: "🧑🏽‍🚀",
  grade: 4,
  xp: 0,
  coins: 0,
  resources: { ...emptyResources },
  crafted: [] as string[],
  completedQuests: [] as string[],
  unlockedLocations: ["beach"] as string[],
  campLevel: 0,
  learningStats: {} as Partial<Record<Skill, LearningStat>>,
  totalAttempts: 0,
  correctAnswers: 0,
  streak: 0,
  bestStreak: 0,
  soundOn: true,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial,
      setStage: (stage) => set({ stage }),
      createExplorer: (nickname, avatar, grade) => set({ nickname, avatar, grade, stage: "intro" }),
      recordAttempt: (challenge, correct) => set((state) => {
        const streak = correct ? state.streak + 1 : 0;
        return {
          learningStats: { ...state.learningStats, [challenge.skill]: updateMastery(state.learningStats[challenge.skill], correct) },
          totalAttempts: state.totalAttempts + 1,
          correctAnswers: state.correctAnswers + (correct ? 1 : 0),
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
        };
      }),
      completeQuest: (questId) => {
        const state = get();
        if (state.completedQuests.includes(questId)) return false;
        const quest = quests.find((entry) => entry.id === questId);
        if (!quest) return false;
        const resources = { ...state.resources };
        for (const key of Object.keys(emptyResources) as ResourceKey[]) resources[key] += quest.reward[key] ?? 0;
        set({
          resources,
          xp: state.xp + quest.reward.xp,
          coins: state.coins + quest.reward.coins,
          completedQuests: [...state.completedQuests, questId],
          unlockedLocations: Array.from(new Set([...state.unlockedLocations, ...quest.unlocks])),
        });
        return true;
      },
      craft: (itemId) => {
        const state = get();
        const item = items.find((entry) => entry.id === itemId);
        if (!item || state.crafted.includes(itemId)) return false;
        const canCraft = (Object.entries(item.cost) as [ResourceKey, number][]).every(([key, amount]) => state.resources[key] >= amount);
        if (!canCraft) return false;
        const resources = { ...state.resources };
        for (const [key, amount] of Object.entries(item.cost) as [ResourceKey, number][]) resources[key] -= amount;
        set({ resources, crafted: [...state.crafted, itemId], xp: state.xp + 15 });
        return true;
      },
      upgradeCamp: () => {
        const state = get();
        if (state.campLevel >= campCosts.length) return false;
        const cost = campCosts[state.campLevel];
        const canBuild = (Object.entries(cost) as [ResourceKey, number][]).every(([key, amount]) => state.resources[key] >= amount);
        if (!canBuild) return false;
        const resources = { ...state.resources };
        for (const [key, amount] of Object.entries(cost) as [ResourceKey, number][]) resources[key] -= amount;
        set({ resources, campLevel: state.campLevel + 1, xp: state.xp + 20 });
        return true;
      },
      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
      reset: () => set({ ...initial, resources: { ...emptyResources } }),
    }),
    { name: "trailbound-save-v1" },
  ),
);

export function campUpgradeCost(level: number) {
  return campCosts[level] ?? null;
}
