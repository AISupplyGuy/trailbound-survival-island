"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Backpack, BookOpen, Check, Hammer, Home, LockKeyhole, Map, MapPin, Settings, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { achievements, items, locations, quests, resourceMeta } from "@/game-data/content";
import { Challenge, ResourceKey } from "@/game/types";
import { selectChallenge } from "@/game/adaptive";
import { campUpgradeCost, useGameStore } from "@/store/game-store";
import { ParentDashboard } from "@/components/ParentDashboard";
import { audioManager } from "@/lib/audio-manager";

type Panel = "map" | "quests" | "inventory" | "craft" | "camp" | "profile" | "parent";

export function GameShell() {
  const game = useGameStore();
  const [panel, setPanel] = useState<Panel>("map");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [toast, setToast] = useState("");
  const [rewardQuest, setRewardQuest] = useState<string | null>(null);
  const activeQuest = quests[game.completedQuests.length];
  const level = Math.floor(game.xp / 120) + 1;
  const xpInLevel = game.xp % 120;

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const visit = (id: string) => {
    if (!game.unlockedLocations.includes(id)) return flash("That trail is still hidden.");
    setLocationId(id);
  };

  const beginChallenge = () => {
    if (!activeQuest) return;
    setChallenge(selectChallenge(activeQuest, game.learningStats, game.grade));
  };

  const finishChallenge = (attempts: number) => {
    if (!challenge || !activeQuest) return;
    const levelBefore = Math.floor(game.xp / 120);
    const earnedXp = activeQuest.reward.xp + (activeQuest.id === "q2" && game.campLevel === 0 ? 20 : 0);
    game.recordAttempt(challenge, true);
    if (activeQuest.id === "q2" && game.campLevel === 0) game.upgradeCamp();
    if (game.completeQuest(activeQuest.id)) {
      audioManager.play(Math.floor((game.xp + earnedXp) / 120) > levelBefore ? "level-up" : "correct");
      setChallenge(null);
      setLocationId(null);
      setRewardQuest(activeQuest.id);
      if (attempts === 1) flash("Perfect first try!");
    }
  };

  return (
    <main className="game-shell">
      <header className="hud">
        <div className="player-badge"><span className="mini-avatar">{game.avatar}</span><div><strong>{game.nickname}</strong><span>Level {level}</span><div className="xp-track"><motion.i animate={{ width: `${(xpInLevel / 120) * 100}%` }} /></div></div></div>
        <div className="hud-resources">
          {(["wood","stone","water"] as ResourceKey[]).map((key) => <span key={key}>{resourceMeta[key].emoji} <b>{game.resources[key]}</b></span>)}
        </div>
        <div className="coin-pill">🪙 <b>{game.coins}</b></div>
        <button className="sound-button" aria-label={game.soundOn ? "Mute game audio" : "Turn on game audio"} onClick={() => {
          const enabled = !game.soundOn;
          audioManager.setEnabled(enabled);
          if (enabled) {
            void audioManager.activate("correct");
            flash("Sound on! Turn up your volume.");
          }
          game.toggleSound();
        }}>{game.soundOn ? <Volume2/> : <VolumeX/>}</button>
      </header>

      <section className="world-stage">
        <div className="map-sky"><span>☁️</span><span>☁️</span></div>
        <div className="island-map">
          <div className="island-water-lines" />
          <svg className="trail-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M49 82 C49 73 50 66 50 58 S34 51 24 48 M50 58 C61 56 67 52 76 51 M76 51 C71 42 69 35 66 28 M66 28 C59 21 54 16 47 12 M24 48 C19 56 18 64 18 72" />
          </svg>
          {locations.map((location) => {
            const unlocked = game.unlockedLocations.includes(location.id);
            const current = activeQuest?.location === location.id;
            return (
              <button className={`map-location ${unlocked ? "unlocked" : "locked"} ${current ? "current" : ""}`} style={{ left:`${location.x}%`, top:`${location.y}%`, "--location-color": location.color } as React.CSSProperties} key={location.id} onClick={() => visit(location.id)} aria-label={`${location.name}${unlocked ? "" : " locked"}`}>
                <span className="location-orbit"/><span className="location-emoji">{unlocked ? location.emoji : <LockKeyhole size={22}/>}</span><strong>{location.name}</strong>
                {current && <em>Quest here</em>}
              </button>
            );
          })}
        </div>
        <aside className="quest-ribbon">
          <div className="scout-face">🦊</div><div><span>{activeQuest ? `${activeQuest.npc} has a plan` : "Island trail complete"}</span><strong>{activeQuest?.title ?? "The signal is shining!"}</strong><p>{activeQuest?.description ?? "You turned every challenge into a way home."}</p></div>
          {activeQuest && <button onClick={() => visit(activeQuest.location)}><MapPin size={18}/> Go</button>}
        </aside>
      </section>

      <nav className="game-dock" aria-label="Game menu">
        <DockButton active={panel === "map"} icon={<Map/>} label="Map" onClick={() => setPanel("map")}/>
        <DockButton active={panel === "quests"} icon={<BookOpen/>} label="Quests" onClick={() => setPanel("quests")}/>
        <DockButton active={panel === "inventory"} icon={<Backpack/>} label="Pack" onClick={() => setPanel("inventory")}/>
        <DockButton active={panel === "craft"} icon={<Hammer/>} label="Craft" onClick={() => setPanel("craft")}/>
        <DockButton active={panel === "camp"} icon={<Home/>} label="Camp" onClick={() => setPanel("camp")}/>
        <DockButton active={panel === "profile"} icon={<Award/>} label="Me" onClick={() => setPanel("profile")}/>
      </nav>

      <AnimatePresence>
        {panel !== "map" && <PanelSheet key="panel" panel={panel} close={() => setPanel("map")} setPanel={setPanel} flash={flash}/>} 
        {locationId && <LocationCard key="location" locationId={locationId} activeQuest={activeQuest} close={() => setLocationId(null)} begin={beginChallenge}/>} 
        {challenge && <ChallengeCard key="challenge" challenge={challenge} close={() => setChallenge(null)} onWrong={() => { game.recordAttempt(challenge, false); audioManager.play("wrong"); }} onCorrect={finishChallenge}/>} 
        {rewardQuest && <RewardCard key="reward" questId={rewardQuest} close={() => setRewardQuest(null)}/>} 
        {toast && <motion.div key="toast" className="toast" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>{toast}</motion.div>}
      </AnimatePresence>
    </main>
  );
}

function DockButton({ active, icon, label, onClick }: { active:boolean; icon:React.ReactNode; label:string; onClick:()=>void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function LocationCard({ locationId, activeQuest, close, begin }: { locationId:string; activeQuest:typeof quests[number] | undefined; close:()=>void; begin:()=>void }) {
  const location = locations.find((entry) => entry.id === locationId)!;
  const isQuest = activeQuest?.location === locationId;
  return <div className="modal-layer" onMouseDown={(e) => e.target === e.currentTarget && close()}><motion.section className="location-card" initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}>
    <button className="close-button" onClick={close}><X/></button><div className="location-scene" style={{ "--scene-color": location.color } as React.CSSProperties}><span>{location.emoji}</span><i>🌿</i><b>🦊</b></div>
    <div className="location-copy"><span className="place-label">You arrived at</span><h2>{location.name}</h2><p>{location.description}</p>
      <div className="npc-bubble"><span>🦊</span><p>{isQuest ? `“${activeQuest.description} Ready to figure it out together?”` : `“Our next clue is somewhere else. We can still enjoy the view!”`}</p></div>
      {isQuest ? <button className="primary-button" onClick={begin}><Sparkles/> Start challenge</button> : <button className="secondary-button" onClick={close}>Back to the trail</button>}
    </div>
  </motion.section></div>;
}

function ChallengeCard({ challenge, close, onWrong, onCorrect }: { challenge:Challenge; close:()=>void; onWrong:()=>void; onCorrect:(attempts:number)=>void }) {
  const [value, setValue] = useState("");
  const [sequence, setSequence] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const chosen = challenge.type === "sequence" ? sequence : value;
  const submit = () => {
    const correct = Array.isArray(challenge.answer) ? JSON.stringify(chosen) === JSON.stringify(challenge.answer) : String(chosen).trim().toLowerCase() === challenge.answer.toLowerCase();
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (correct) return onCorrect(nextAttempts);
    onWrong();
    setFeedback(nextAttempts > 1 ? challenge.hints[1] : challenge.hints[0]);
    if (challenge.type === "sequence") setSequence([]);
  };
  return <div className="modal-layer challenge-layer"><motion.section className="challenge-card" initial={{ scale:.88, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.9, opacity:0 }}>
    <button className="close-button" onClick={close}><X/></button><div className="challenge-top"><span>{challenge.subject}</span><div>{Array.from({length:5}).map((_,i) => <i className={i < challenge.difficulty ? "on" : ""} key={i}/>)}</div></div>
    <div className="challenge-illustration">{challenge.location === "river" ? "🫗💧" : challenge.location === "cave" ? "💎🔦" : challenge.location === "mountain" ? "📻⚡" : "🦊🧭"}</div>
    <p className="story-copy">{challenge.story}</p><h2>{challenge.prompt}</h2>
    {challenge.type === "choice" && <div className="choice-grid">{challenge.options?.map((option) => <button className={value === option ? "selected" : ""} onClick={() => setValue(option)} key={option}>{option}</button>)}</div>}
    {challenge.type === "number" && <input className="number-answer" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="?" aria-label="Your answer"/>}
    {challenge.type === "sequence" && <div className="sequence-area"><div className="sequence-slots">{challenge.options?.map((_, i) => <span key={i}>{sequence[i] ?? i + 1}</span>)}</div><div className="sequence-options">{challenge.options?.filter(option => !sequence.includes(option)).map(option => <button onClick={() => setSequence([...sequence, option])} key={option}>{option}</button>)}</div>{sequence.length > 0 && <button className="tiny-button" onClick={() => setSequence([])}>Start over</button>}</div>}
    {feedback && <motion.div className="hint-bubble" initial={{ x:-12, opacity:0 }} animate={{ x:0, opacity:1 }}><span>🦊</span><p><strong>Almost!</strong> {feedback}</p></motion.div>}
    <button className="primary-button" disabled={challenge.type === "sequence" ? sequence.length !== challenge.options?.length : !value} onClick={submit}>Check my plan</button>
    <div className="adaptive-note"><Sparkles size={15}/> Scout Sense chose this challenge for your trail</div>
  </motion.section></div>;
}

function RewardCard({ questId, close }: { questId:string; close:()=>void }) {
  const quest = quests.find(q => q.id === questId)!;
  return <div className="modal-layer reward-layer"><motion.section className="reward-card" initial={{ scale:.5, rotate:-4, opacity:0 }} animate={{ scale:1, rotate:0, opacity:1 }}>
    <div className="reward-burst">✦</div><span className="reward-scout">🦊</span><h2>Trail cleared!</h2><p>{quest.title} is complete.</p>
    <div className="reward-pills">{Object.entries(quest.reward).map(([key,value]) => <span key={key}>{key === "xp" ? "✨" : key === "coins" ? "🪙" : resourceMeta[key as ResourceKey].emoji} +{value} {key}</span>)}</div>
    {quest.unlocks.length > 0 && <strong className="unlocked-callout">New trail: {locations.find(l => l.id === quest.unlocks[0])?.name}</strong>}
    <button className="primary-button" onClick={close}>Back to the island</button>
  </motion.section></div>;
}

function PanelSheet({ panel, close, setPanel, flash }: { panel:Panel; close:()=>void; setPanel:(panel:Panel)=>void; flash:(message:string)=>void }) {
  const game = useGameStore();
  const campCost = campUpgradeCost(game.campLevel);
  const canAfford = (cost: Partial<Record<ResourceKey, number>>) => (Object.entries(cost) as [ResourceKey,number][]).every(([key,value]) => game.resources[key] >= value);
  const earned = achievements.filter(([id]) => id === "first-step" ? game.completedQuests.length >= 1 : id === "builder" ? game.completedQuests.includes("q2") : id === "crafter" ? game.crafted.length > 0 : id === "streak" ? game.bestStreak >= 3 : id === "scientist" ? (game.learningStats.science?.correct ?? 0) >= 3 : id === "pathfinder" ? game.unlockedLocations.length === locations.length : id === "signal" ? game.completedQuests.includes("q7") : game.completedQuests.includes("q8"));

  return <div className="panel-layer"><motion.section className="panel-sheet" initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }} transition={{ type:"spring", damping:28, stiffness:280 }}>
    <button className="close-button" onClick={close}><X/></button>
    {panel === "quests" && <><PanelTitle icon="📜" title="Trail journal" subtitle={`${game.completedQuests.length} of ${quests.length} quests cleared`}/><div className="quest-list">{quests.map((quest,index) => <article className={index === game.completedQuests.length ? "active" : game.completedQuests.includes(quest.id) ? "done" : "locked"} key={quest.id}><span>{game.completedQuests.includes(quest.id) ? <Check/> : index + 1}</span><div><h3>{quest.title}</h3><p>{quest.description}</p><small>{quest.npc} · {locations.find(l => l.id === quest.location)?.name}</small></div>{index === game.completedQuests.length && <b>Active</b>}</article>)}</div></>}
    {panel === "inventory" && <><PanelTitle icon="🎒" title="Explorer pack" subtitle="Everything you’ve found and made"/><div className="inventory-grid">{(Object.keys(resourceMeta) as ResourceKey[]).map(key => <article key={key}><span>{resourceMeta[key].emoji}</span><b>{game.resources[key]}</b><p>{resourceMeta[key].label}</p></article>)}{items.filter(item => game.crafted.includes(item.id)).map(item => <article className="tool" key={item.id}><span>{item.emoji}</span><b>1</b><p>{item.name}</p><small>{item.rarity}</small></article>)}</div></>}
    {panel === "craft" && <><PanelTitle icon="🛠️" title="Scout’s workbench" subtitle="Turn island finds into trail tools"/><div className="craft-list">{items.map(item => { const made=game.crafted.includes(item.id); const ready=canAfford(item.cost); return <article key={item.id}><span>{item.emoji}</span><div><h3>{item.name}</h3><p>{item.description}</p><div className="cost-row">{Object.entries(item.cost).map(([key,value]) => <small className={game.resources[key as ResourceKey] >= value ? "enough" : ""} key={key}>{resourceMeta[key as ResourceKey].emoji} {value}</small>)}</div></div><button disabled={made || !ready} onClick={() => { if(game.craft(item.id)) { audioManager.play("craft"); flash(`${item.name} crafted!`); } }}>{made ? "Made" : ready ? "Craft" : "Need items"}</button></article>})}</div></>}
    {panel === "camp" && <><PanelTitle icon="⛺" title="Explorer camp" subtitle={`Camp level ${game.campLevel} of 5`}/><div className={`camp-scene camp-${game.campLevel}`}><span className="camp-structure">{game.campLevel === 0 ? "🪵" : game.campLevel < 3 ? "⛺" : game.campLevel < 5 ? "🏕️" : "🏡"}</span><span className="camp-fire">{game.campLevel >= 2 ? "🔥" : ""}</span><span className="camp-tools">{game.campLevel >= 3 ? "🛠️" : ""}</span></div>{campCost ? <div className="upgrade-box"><div><h3>{["Basic shelter","Tent & fire","Workbench","Sturdy lodge","Explorer base"][game.campLevel]}</h3><div className="cost-row">{Object.entries(campCost).map(([key,value]) => <small className={game.resources[key as ResourceKey] >= value ? "enough" : ""} key={key}>{resourceMeta[key as ResourceKey].emoji} {value}</small>)}</div></div><button disabled={!canAfford(campCost)} onClick={() => { if (game.upgradeCamp()) { audioManager.play("craft"); flash("Camp upgraded!"); } }}>Build</button></div> : <div className="complete-box">Your camp is legendary! 🏆</div>}</>}
    {panel === "profile" && <><PanelTitle icon={game.avatar} title={game.nickname} subtitle={`Level ${Math.floor(game.xp/120)+1} explorer`}/><div className="profile-stats"><article><b>{game.xp}</b><span>Total XP</span></article><article><b>{game.bestStreak}</b><span>Best streak</span></article><article><b>{earned.length}</b><span>Badges</span></article></div><h3 className="section-heading">Badge shelf</h3><div className="badge-shelf">{achievements.map(([id,name,description,emoji]) => { const has=earned.some(([earnedId]) => earnedId===id); return <article className={has ? "earned" : ""} key={id}><span>{has ? emoji : "❔"}</span><div><b>{name}</b><small>{description}</small></div></article>})}</div><div className="settings-row"><button onClick={() => setPanel("parent")}>Parent progress view</button><button className="danger-link" onClick={() => { if(window.confirm("Reset this adventure and start over?")) game.reset(); }}><Settings/> Reset adventure</button></div></>}
    {panel === "parent" && <ParentDashboard embedded onBack={() => setPanel("profile")}/>} 
  </motion.section></div>;
}

function PanelTitle({ icon,title,subtitle }: { icon:React.ReactNode; title:string; subtitle:string }) { return <div className="panel-title"><span>{icon}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
