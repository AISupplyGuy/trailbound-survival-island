# Nerdy AI Hackathon Submission Packet

## Prompt

Bring your own idea

## What did you build?

Trailbound: Survival Island is a mobile-first adaptive learning adventure for children ages 8–12. A storm strands the player on a mysterious island, where math, science, reading, and logic challenges directly power exploration: solving a contextual problem earns supplies, opens trails, crafts tools, upgrades camp, and advances an eight-quest rescue story.

The working vertical slice includes character creation, an animated introduction, seven unlockable locations, 25 educational challenges, supportive hints, resource and XP progression, crafting, camp upgrades, achievements, persistent local saves, original procedural music, and a separate parent progress view.

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

Third-party open-source software: Next.js, React, TypeScript, Zustand, Framer Motion, Lucide React, Playwright, ESLint, and their transitive dependencies under their respective licenses. Fonts: Nunito and Bowlby One SC under the SIL Open Font License. The soundtrack and interface sounds are generated procedurally with the browser's Web Audio API. No real student data was used, and the entry does not collect biometric information.
