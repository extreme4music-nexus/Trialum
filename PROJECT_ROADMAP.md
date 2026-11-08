# TRIALUM — PROJECT ROADMAP · 2026–2028+

> Canonical development roadmap. Updated 8 November 2026 for **1.5.5**. Every release must pass its own test gate before merging to `main`. Developer builds are NOT Play Store releases. No hidden paid features, background LLM downloads, or mandatory Google sign-in.

## Current baseline & release gates

| Version / phase | State | Deliverable | Gate before next phase |
|---|---|---|---|
| 1.4.1 | Existing `main` baseline at roadmap authoring | Long play, Android debug, mini offline LLM | Existing regression suite |
| 1.5.0–1.5.2 | Developed on feature branches | 2.5D fauna, audio/media, eye blinking repair | UI and physical device |
| 1.5.3 | Android SDK 36 branch, device-tested by owner | API 36, build tools, compatibility | Android 16 smoke test |
| 1.5.4 | Google Play Games beta with successful CI, Play Console NOT configured | Optional sign-in, achievements, boards, Cloud Save/Restore | Real OAuth and Saved Games on devices before calling PGS production-ready |
| **1.5.5** | **Current development** | Mnemoss intelligence, opt-in advanced local model, intro/tutorial, system and manual theme, 17-language architecture and locale selection | JS tests, Android APK, new/old save migration, phone battery/RAM, accessibility, translation audit |
| 1.5.5 QA/RC | Future, requires review | On-device test rounds and bug fixes | No data loss, crashes or blocker bugs; human review |
| Google Play Closed Testing | **After 15 Nov 2026**, dependent on budget and Play Console | Dev account, app registration, signing, policy documents, testers, AAB | Internal/closed Play testing + accurate Data Safety declaration |
| Google Play Games live test | After Play setup | Real auth, achievements, saved games across 2 devices | Verified snapshots and conflict handling; no forced login |
| 1.6+ fair monetization | After Play testing and approval | Optional low-price unlocks, cosmetic bundles, XP or credit packs with conspicuous values | Google Play Billing, purchase verification, refund and anti-abuse; do NOT award paid products on client claim alone |
| 1.7+ live game content | Future | Seasonal biomes, appearance themes, additional fauna, evolving narrative | Save backward compatibility and creator rights |
| 2.x cross-platform | Only after Android traction | Apple App Store/iOS/macOS, Microsoft Store/Windows, downloadable Linux and website | Native build/signing, platform-specific licensing, QA, publishing policies |

## Non-negotiable principles

1. A single local world is authoritative until an explicit cloud restore is confirmed. JSON export/import remains supported.
2. Optional Google sign-in. Offline gameplay, tutorial, locales and themes never depend on Google.
3. Advanced LLM is **download-optional**, with on-device size/RAM warnings, separately verified checksums, explicit consent, and no AI inference for locked creatures. No fake AI, no claim of human-like feelings: emotions are simulated game state.
4. Mnemoss unlock must be retroactive: any existing qualifying pet gets the option; no world reset. Never rewrite user chat history silently.
5. Language default: automatic device/browser locale if supported, otherwise English (Macedonian for MK); player may override. Never auto-translate names and written history. Do not present an incomplete machine-generated catalog as proof of 100% localization; audit each locale.
6. Theme default: follow OS `prefers-color-scheme`; allow override Light/Dark/System. Controls are accessible and save with local game settings.
7. Keep releases sequential. No parallel paid store, cross-platform or backend development during 1.5.5; independent QA precedes merge.
8. All docs in root and `docs/` must describe the actual implementation and clearly distinguish proven tests from unverified Android device results.

## Acceptance checklist: 1.5.5

- [ ] Advanced local GGUF tier is **real**, not a placeholder; optional consent, checksums, graceful RAM/storage failure, no remote prompts.
- [ ] Per-pet personality, bounded conversation memory, emotions and corresponding visual actions; privacy and data persistence documented.
- [ ] Retroactive gate for eligible Mnemoss, no forced pet transformation, migration preserves existing saves.
- [ ] Intro on first run, skippable, replayable guided tutorial with accessible navigation; does not block normal game or returners.
- [ ] English new menus/strings audited; 15 *additional* named language packs besides MK/EN are shipped with truthful coverage limits.
- [ ] OS/browser language detection plus manual override; locale persists, changes applied to dynamic content.
- [ ] Theme system/dark/light with immediate switch, persistence, OS change listener and contrast/phone UI checks.
- [ ] JS/UI/localization/model contract test suite and Android SDK36 debug APK PASS.
- [ ] Documentation, changelog, Android guide, privacy/Play roadmap and migration notes updated.
- [ ] PR review, backup/export instructions, main sync only after automatic tests and manual QA constraints recorded.

## Scope deliberately deferred

Real Google services credentials, billing contracts, subscription infrastructure, Apple and Microsoft signing, Linux packaging, and public store releases. The basic offline 135M model exists in 1.5.4; large model performance requires measurement on representative Android devices.
