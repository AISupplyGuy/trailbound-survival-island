"use client";

import { ArrowLeft, Brain, ShieldCheck, Sparkles } from "lucide-react";
import { masteryLabel } from "@/game/adaptive";
import { locations, quests } from "@/game-data/content";
import { Skill } from "@/game/types";
import { useGameStore } from "@/store/game-store";

export function ParentDashboard({ embedded = false, onBack }: { embedded?: boolean; onBack?: () => void }) {
  const game = useGameStore();
  const accuracy = game.totalAttempts ? Math.round((game.correctAnswers/game.totalAttempts)*100) : 0;
  const skills = Object.entries(game.learningStats) as [Skill, {attempts:number;correct:number;mastery:number}][];
  return <main className={embedded ? "parent-dashboard embedded" : "parent-dashboard"}>
    {onBack && <button className="back-link" onClick={onBack}><ArrowLeft/> Explorer profile</button>}
    <div className="parent-heading"><div><span className="parent-mark"><ShieldCheck/> Grown-up view</span><h2>{game.nickname || "Your explorer"}’s adventure</h2><p>Learning signals from play—not grades, rankings, or pressure.</p></div><div className="ai-badge"><Brain/><div><b>Scout Sense</b><span>Privacy-first adaptation active</span></div></div></div>
    <section className="parent-metrics"><article><b>{game.completedQuests.length}/{quests.length}</b><span>Quests cleared</span></article><article><b>{accuracy}%</b><span>Success rate</span></article><article><b>{game.totalAttempts}</b><span>Challenges tried</span></article><article><b>{game.unlockedLocations.length}/{locations.length}</b><span>Places found</span></article></section>
    <section className="learning-panel"><div className="learning-title"><div><Sparkles/><div><h3>Adaptive learning trail</h3><p>Scout Sense uses Bayesian knowledge tracing to adjust the next challenge locally on this device.</p></div></div><span>No child data is sent away</span></div>
      {skills.length ? <div className="skill-list">{skills.map(([skill,stat]) => <article key={skill}><div><b>{skill}</b><span>{masteryLabel(stat.mastery)} · {stat.correct}/{stat.attempts} correct</span></div><div className="mastery-track"><i style={{width:`${Math.round(stat.mastery*100)}%`}}/></div><strong>{Math.round(stat.mastery*100)}%</strong></article>)}</div> : <div className="empty-learning">Complete the first island challenge to reveal a learning trail.</div>}
    </section>
    <p className="parent-footnote">Mastery is an estimate used to choose supportive practice, not a diagnosis or school grade.</p>
  </main>;
}
