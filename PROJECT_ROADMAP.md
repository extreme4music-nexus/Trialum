# TRIALUM — PROJECT ROADMAP · 2026–2028+

> Canonical development roadmap. Updated 8 November 2026 for **1.5.6 planning and server foundation**. Every release must pass its own test gate before merging to `main`. Developer builds are NOT Play Store releases. No hidden paid features, background LLM downloads, or mandatory Google sign-in.

## Current baseline & release gates

| Version / phase | State | Deliverable | Gate before next phase |
|---|---|---|---|
| 1.4.1 | Existing `main` baseline at roadmap authoring | Long play, Android debug, mini offline LLM | Existing regression suite |
| 1.5.0–1.5.2 | Developed on feature branches | 2.5D fauna, audio/media, eye blinking repair | UI and physical device |
| 1.5.3 | Android SDK 36 branch, device-tested by owner | API 36, build tools, compatibility | Android 16 smoke test |
| 1.5.4 | Google Play Games beta with successful CI, Play Console NOT configured | Optional sign-in, achievements, boards, Cloud Save/Restore | Real OAuth and Saved Games on devices before calling PGS production-ready |
| **1.5.5** | **Merged into main (debug beta; physical QA pending)** | Mnemoss intelligence, opt-in advanced local model, intro/tutorial, system and manual theme, 17-language architecture and locale selection | JS tests, Android APK, new/old save migration, phone battery/RAM, accessibility, translation audit |
| 1.5.5 QA/RC | Future, requires review | On-device test rounds and bug fixes | No data loss, crashes or blocker bugs; human review |
| **1.5.6-A** | **Current: server foundation and approved product plan** | Privacy/earnability charter, Ubuntu Docker+Postgres localhost scaffold, social spec and tests | Server contract CI, no public endpoints, NAS isolation verified |
| 1.5.6-B–F | Planned, NOT implemented | Friends UX + auth/invites, skill animation, playground, collaborative visits, message cards and optional push | Full two-phone QA, security/privacy audit, save migration, owner signoff |
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
7. Keep releases sequential: 1.5.5 remains debug-beta, 1.5.6-A through F run in order; independent QA precedes each gate and merge.
8. No external ads, advertising SDKs, data brokerage or selling user data. No coercive monetization: future purchasable gameplay advantages are earnable by reasonable normal play and Play Billing/verification is deferred.
9. Privacy and NAS safety: isolate social backend, pseudonymous opt-in accounts, minimal data required for messages/visits, deletion/export, WireGuard-only admin, no public Webmin or Postgres, no hosted user-data dashboards or tracking.
10. All docs in root and `docs/` must describe the actual implementation and clearly distinguish proven tests from unverified Android device results.

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


## TRIALUM 1.5.6 — Social, Skills & Shared Playground (approved scope)

**Current delivery is 1.5.6-A design and localhost-only server foundation, NOT the completed version or a new APK.** Full scope:
- One/two-tap friend pairing, Nearby discovery when available, Android Sharesheet and validated time-limited invite links; fix prior manual WebRTC SDP bug without exposing JSON to users.
- All six learnable skills have working visible actions at every evolution stage, playable controls, actual skill level impact and accessible reduced-motion behavior.
- Local playground unlock at pet level 15 + research lab level 4, retroactively; sandbox and seesaw immediately free, slide/pool/obstacles/trampoline earned via milestones and resource crafting.
- Friends can visit habitat or consent-based shared playground, including lower-level invited friends; group members cooperatively expand space and unlock toys with server-audited contributions and pet-safe return.
- Real-time shared scene event synchronization, no raw-video streaming; resilient reconnect, no double credit.
- Short opt-in message cards and visit notifications. Push via FCM only when enabled, privacy disclosures; in-game inbox otherwise. No general chat channels.
- Ads prohibited outside of untracked internal game release announcements. No data broker sharing, no behavioral profiling. Any essential transient service records are explicitly disclosed and minimized.
- No active billing in 1.5.6; later optional token/XP/resource/activity bundles available equally by normal play. Play Billing integration only in future release with store and backend verification.
- Own Ubuntu NAS used only for isolated testing, private Webmin over existing router WireGuard. Loopback-only Docker first; Tailscale Funnel public beta only after auth and abuse gate and license review. Future migration to paid domain + cloud.

### Authoritative detailed documents

- [Master implementation plan](docs/V1.5.6_MASTER_PLAN.md)
- [Privacy, no ads, earnable purchases](docs/V1.5.6_PRIVACY_AND_FAIR_PLAY.md)
- [Ubuntu NAS-safe server installation](docs/V1.5.6_HOME_SERVER.md)
- [1.5.6-A localhost server scaffold](server/README.md)

### Gates
- [x] Scope documented, privacy and earning policy fixed.
- [x] Separate 1.5.6 development branch with isolated server scaffold and contract tests in source.
- [ ] Green GitHub Actions 1.5.6-A CI; Ubuntu docker test and DB restore on owner's server.
- [ ] 1.5.6-B auth/consent + friend invite/deep link and Nearby dual-phone QA.
- [ ] 1.5.6-C visual six-skill actions and solo playground with retroactive save tests.
- [ ] 1.5.6-D shared playground visits/contributions with atomic server authorization.
- [ ] 1.5.6-E safe short messages, opt-in push and deletion/export.
- [ ] 1.5.6-F independent security/privacy/accessibility audit and Android device QA; final APK only then.
