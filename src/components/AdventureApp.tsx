"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { GameShell } from "@/components/GameShell";
import { audioManager } from "@/lib/audio-manager";

const avatars = ["🧑🏽‍🚀", "👩🏻‍🚀", "🧑🏿‍🔬", "👩🏼‍🔧", "🧑🏻‍🌾", "👩🏾‍🚒"];
export function AdventureApp() {
  const [hydrated, setHydrated] = useState(false);
  const { stage, setStage, createExplorer, soundOn } = useGameStore();
  useEffect(() => {
    // Intentional client boundary: persisted game state is unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  useEffect(() => audioManager.setEnabled(soundOn), [soundOn]);
  useEffect(() => audioManager.setTheme(stage === "game" ? "island" : "intro"), [stage]);
  if (!hydrated) return <div className="loading-screen"><Compass className="spin" /> Charting the island…</div>;

  return (
    <div onClickCapture={(event) => {
      if (event.target instanceof Element && event.target.closest("button")) void audioManager.activate("click");
    }}>
      <AnimatePresence mode="wait">
        {stage === "landing" && <Landing key="landing" onPlay={() => setStage("profile")} />}
        {stage === "profile" && <Profile key="profile" onDone={createExplorer} />}
        {stage === "intro" && <Intro key="intro" onDone={() => setStage("game")} />}
        {stage === "game" && <GameShell key="game" />}
      </AnimatePresence>
    </div>
  );
}

function Landing({ onPlay }: { onPlay: () => void }) {
  return (
    <motion.main className="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="sun" />
      <div className="cloud cloud-one">☁️</div><div className="cloud cloud-two">☁️</div>
      <section className="landing-copy">
        <div className="brand-mark"><Compass size={24} /> Trailbound</div>
        <h1>Survival<br />Island</h1>
        <p>A storm. A secret island. One very clever explorer.</p>
        <button className="hero-button" onClick={onPlay}><Sparkles size={20} /> Play adventure</button>
        <span className="save-note">Your progress saves on this device</span>
      </section>
      <div className="hero-island" aria-hidden="true">
        <div className="hero-mountain">🏔️</div><div className="hero-trees">🌴🌲🌴</div><div className="hero-camp">⛺</div><div className="hero-scout">🦊</div>
      </div>
      <div className="waves waves-one"/><div className="waves waves-two"/>
    </motion.main>
  );
}

function Profile({ onDone }: { onDone: (nickname: string, avatar: string, grade: number) => void }) {
  const [avatar, setAvatar] = useState(avatars[0]);
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState(4);
  return (
    <motion.main className="setup-screen" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }}>
      <form className="setup-card" onSubmit={(event) => { event.preventDefault(); onDone(nickname.trim() || "Explorer", avatar, grade); }}>
        <span className="step-chip">Explorer passport</span>
        <h2>Who washed ashore?</h2>
        <p>Pick your trail look. You can change it later.</p>
        <div className="avatar-grid">
          {avatars.map((option) => <button type="button" aria-label={`Choose avatar ${option}`} className={avatar === option ? "avatar active" : "avatar"} onClick={() => setAvatar(option)} key={option}>{option}</button>)}
        </div>
        <label>Explorer nickname<input maxLength={16} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Sky" autoFocus /></label>
        <label>Learning trail<select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>{[3,4,5,6,7].map((value) => <option value={value} key={value}>Grade {value}</option>)}</select></label>
        <button className="primary-button" type="submit">Set sail <span>→</span></button>
      </form>
    </motion.main>
  );
}

function Intro({ onDone }: { onDone: () => void }) {
  const [scene, setScene] = useState(0);
  const scenes = [
    ["🌊⛵⚡", "The storm came out of nowhere…"],
    ["🏝️🌤️", "You wake on an island that isn’t on any map."],
    ["🦊📻", "Good news: Scout found you. Bad news: the radio is toast."],
  ];
  const [art, text] = scenes[scene];
  return (
    <motion.main className="story-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div key={scene} className="story-panel" initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="story-art">{art}</div><h2>{text}</h2>
        <div className="story-dots">{scenes.map((_, i) => <i className={i === scene ? "active" : ""} key={i}/>)}</div>
        <button className="primary-button" onClick={() => scene < scenes.length - 1 ? setScene(scene + 1) : onDone()}>{scene < 2 ? "Keep going" : "Explore the shore"}</button>
      </motion.div>
    </motion.main>
  );
}
