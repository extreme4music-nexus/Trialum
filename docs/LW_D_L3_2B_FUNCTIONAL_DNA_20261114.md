# LW-D L3.2-B — Functional DNA machines | 2026-11-14

Owner scope: separate LW-D SignQA app ONLY. Based on L3.2-A. Not merged into main / Codex Release / FriendsDebug / beta / Play Console. No new Firebase identity, key, or backend service. Read docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md before the next phase.

## Implemented
- Genome scanner reads the real selected pet's hue, eyes, shape, genome signature and level. No game action.
- Gene-design station controls fictional hue (0–359), 1–5 eyes, and four permitted body forms. It requires explicit user confirmation. The parent game's ORIGINAL E.editFictionalGenes is solely responsible for eligibility, charging 25 molecules + 15 insight + 1 lab action, XP, save, and result. The 3D scene never directly edits saved pet data.
- Lineage station displays actual existing species and researched fauna with individual requirements read from E.longplayRequirements. Explicit confirmation calls the ORIGINAL E.longplayTransform for the selected existing pet. The original system alone validates source, habitat/capacity, eligibility, price, same pet ID, lineage, memory, rewards and save.
- The 3D iframe requests only whitelisted operations design/transform. The parent verifies exact source window and origin; its TrialumLWBridge.dnaOperation validates data, executes the original engine and responds with result and authoritative updated snapshot. The HUD prevents duplicate pending taps and refreshes drafts on pet identity, genome or appearance changes.
- Camera distance in DNA focus changed to 7.2 and minimum zoom to 6.6, keeping the camera outside worktables; existing gesture navigation and corridor/classic fallbacks remain.
- A short green/red machine pulse only follows the real game engine's success/fail response. No animation feedback implies a reward or real biology. No background LLM or rendering.

## Non-negotiable preserved features
- No schema migration, new resources, pet duplication, fictional XP or independent DNA controller.
- Existing classic DNA panel, five-door corridor, L3.1 basic lab, LW-C AI/social, backups, Play Games opt-in, FCM and saved world remain accessible.
- Codex alone owns official Release and Friends Debug. Only Signing QA is this branch's test package.

## Test and release contract
- Node tests: tests/lw-d-dna-actions.test.cjs, prototypes/lw-d/dna-room.test.cjs and all original LW-D/LW-C/FCM guard suites, plus node --check for parent/child scripts.
- GitHub Actions only builds :app:assembleSignqa with existing TRIALUM_FIREBASE_APP_ID_SIGNQA. The trusted owner-push signing job uses existing TRIALUM_QA_KEYSTORE_B64, TRIALUM_QA_STORE_PASS, TRIALUM_QA_KEY_PASS, TRIALUM_QA_CERT_SHA256 and alias trialum-qa; it verifies the pinned signature and creates installable signed internal QA APK. No local signing or new credentials.
- Owner QA: update the existing SignQA app without uninstalling or clearing world. Open 3D > laboratory corridor > DNA lab. Check scanner, editing controls and confirmation cancellation (MUST spend zero). For an actual design on expendable test progress, confirm identical selected pet ID, -25 molecules, -15 insight, -1 action, engine-awarded XP, saved result. Check locked state with insufficient level/resources.
- In lineage station, check all locked conditions and source species; a permitted transform maintains same pet identity and history and spends only what the current engine requires. A failure must not deduct resources.
- Recheck camera/return, Classic DNA fallback, backups, social/AI, bilingual text, and existing FCM. Record owner verdict before merge.

## Future evolution
L3.2-C is materials/lighting/mobile performance refinement. User additionally expects later deliberate redesign of some gameplay mechanics. Scope that separately, with reversible migration and tests; do NOT sneak changes to economy, AI, memory or DNA progression into a rendering-only branch.

Status: implementation checked in; CI/build evidence and physical-device acceptance recorded separately.
