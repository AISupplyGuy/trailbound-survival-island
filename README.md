# Trailbound: Survival Island

Trailbound is a playable, privacy-first learning adventure for ages 8–12. A storm strands the player on a mysterious island; every math, science, reading, and logic challenge directly helps them gather supplies, build camp, open trails, and repair a rescue signal.

This is a hackathon vertical slice, not a screen mockup. A complete run includes onboarding, an animated story, eight sequential quests, adaptive challenges, seven unlockable locations, rewards, crafting, five camp upgrades, achievements, persistence, and a separate parent progress view.

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. Production verification:

```bash
npm run lint
npm run build
npm start
```

## Why this is AI-powered

“Scout Sense” uses Bayesian knowledge tracing to estimate mastery after every attempt. It accounts for guessing, slips, and learning, then selects the next quest challenge closest to the learner’s current level. Difficulty changes are intentionally invisible in the child’s interface; the parent view explains the estimate and shows evidence behind it.

The model runs entirely in the browser. No account, API key, student record, voice sample, biometric signal, or network request is required. That makes the demo reliable and keeps the children’s data on their device.

## Architecture

- `src/game-data/content.ts`: quests, 25 challenges, locations, recipes, items, achievements, and resource metadata
- `src/game/adaptive.ts`: Bayesian mastery update and adaptive challenge selection
- `src/store/game-store.ts`: centralized Zustand state, guarded rewards/crafting, progression, and versioned local persistence
- `src/components/AdventureApp.tsx`: landing, explorer creation, and story onboarding
- `src/components/GameShell.tsx`: map, encounter, challenge, reward, quest, inventory, crafting, camp, and profile experiences
- `src/components/ParentDashboard.tsx`: separate grown-up learning insights, also available at `/parent`
- `src/lib/audio-manager.ts`: original procedural island music and synthesized game feedback sounds

Content is separate from UI, and all challenge types conform to one data contract. New worlds can reuse the same state, quest, reward, and adaptive-learning engines.

## Audio

The game creates its soundtrack at runtime with the browser’s Web Audio API. A calm “setting out” melody begins after the first player gesture, then changes to a faster island theme when the main map appears. Every button uses a clear two-note tap cue, while distinct sounds support correct answers, gentle retries, quest rewards, crafting, camp building, and level-ups. The persisted speaker control mutes both music and effects immediately. No third-party audio files or licenses are required.

## Implemented challenge types

- Multiple choice
- Numeric entry
- Tap-to-order sequencing

Wrong answers never remove progress. Scout offers a first hint, then a stronger scaffold, and lets the learner try again without lives or penalties.

## Hackathon disclosure

Generative AI was used as a directed coding and design assistant during implementation. The adaptive learner model itself is deterministic and runs locally; it does not call a generative model.

Third-party open-source software: Next.js, React, TypeScript, Zustand, Framer Motion, Lucide React, ESLint, and their transitive dependencies under their respective permissive licenses. Fonts are served through Next.js from Google Fonts: Nunito and Bowlby One SC under the SIL Open Font License. No real student data was used, and the product does not collect biometric information.

## Intentionally left for phase two

- Authenticated cross-device saves and parent accounts
- Server-calibrated mastery parameters based on consented, anonymized usage
- Original illustrated sprite pack and expanded location-specific musical arrangements
- Drag-and-drop, matching, and visual-manipulative challenge renderers
- Daily expeditions, new regions, and authoring tools

## Best next five additions

1. Add a short narrated demo mode that reliably showcases adaptation in under three minutes.
2. Commission an original Scout sprite sheet and island environment pack.
3. Add a visual fraction manipulative and geometry bridge-builder mini-game.
4. Build a teacher-authored challenge editor with automated safety and readability checks.
5. Add consented cloud sync with separate child and parent access.
