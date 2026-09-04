# Nerdy AI Hackathon Submission Packet

## Prompt

Bring your own idea

## What did you build?

Trailbound: Survival Island is a mobile-first adaptive learning adventure for children ages 8–12. A storm strands the player on a mysterious island, where math, science, reading, and logic challenges directly power exploration: solving a contextual problem earns supplies, opens trails, crafts tools, upgrades camp, and advances an eight-quest rescue story.

The working vertical slice includes character creation, an animated introduction, seven unlockable locations, 25 educational challenges, supportive hints, resource and XP progression, crafting, camp upgrades, achievements, persistent local saves, original procedural music, and a separate parent progress view.

The entry was created and substantially developed during the Challenge entry period, beginning September 2, 2026.

I built Trailbound with Next.js, React, TypeScript, Zustand, Framer Motion, and the Web Audio API. Its privacy-first adaptive engine, Scout Sense, uses Bayesian knowledge tracing to update skill-mastery estimates from correct answers, mistakes, and retries. It then selects a challenge near the learner's estimated level without labeling or exposing difficulty changes to the child. The model runs locally; no account, student record, voice sample, biometric signal, or personal information is collected or transmitted.

Next, I would add original character animation, visual math manipulatives, additional worlds, educator authoring tools, consented cross-device saves, and model calibration using anonymized, permissioned learning data.

## Live demo

https://trailbound-survival-island.vercel.app

## Code repository

https://github.com/AISupplyGuy/trailbound-survival-island

## Demonstration video

`output/playwright/trailbound-demo/trailbound-2m10-playthrough.mp4`

Duration: 2 minutes 10 seconds. Full-screen gameplay with no narration.

## Anything else / required disclosures

Generative AI assistance: OpenAI Codex was used under my direction for implementation, product and visual design, testing, debugging, deployment, and demonstration-video production. The submitted adaptive-learning model is deterministic and does not call a generative model at runtime.

Third-party open-source software: Next.js (MIT), React and React DOM (MIT), Zustand (MIT), Framer Motion (MIT), Lucide React (ISC), TypeScript (Apache-2.0), Playwright (Apache-2.0; development/demo tooling only), and ESLint (MIT). Optional dependencies are omitted from installation and deployment; the entry does not install or use Sharp/libvips. The interface uses a system font stack and bundles no font files. Unicode emoji characters are rendered by the user's browser or operating system; no emoji artwork or emoji-font files are bundled with the product. Demo footage may show system-rendered Unicode emoji glyphs supplied by the recording environment. The soundtrack and interface sounds are original and generated procedurally with the browser's Web Audio API. Hosting is provided by Vercel, and source hosting is provided by GitHub. No real student data was used, and the entry does not collect biometric information.
