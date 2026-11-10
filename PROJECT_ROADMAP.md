# TRIALUM — PROJECT ROADMAP · 2026–2028+

> Canonical development roadmap. Updated 9 November 2026 for **1.5.6-A–F source beta and release acceptance matrix**. Every release must pass its own test gate before merging to `main`. Developer builds are NOT Play Store releases. No hidden paid features, background LLM downloads, or mandatory Google sign-in.

## Active next initiative — Living World (2026-11-09)

**Canonical detailed implementation roadmap:** [Living World roadmap — 15 tester requirements, milestones LW-00/A–F, acceptance gates and evidence rules](docs/TRIALUM_LIVING_WORLD_ROADMAP_2026.md).

**Status: DOCUMENTATION / DESIGN ONLY** on isolated branch `docs/trialum-living-world-roadmap-20261109`; no new Living World gameplay has been implemented or released. This is the **single authoritative plan for the new initiative**. Historical 1.5.6-A–F descriptions below remain preserved as release history and pending manual gates, **not** a second execution queue.

**Sequence (no parallel implementation):** LW-00 roadmap approval → LW-A exclusive per-pet location/presence + migration → LW-B home/playground screen separation and offscreen rendering → LW-C autonomous local playground + bounded XP and skill summary → LW-D smooth visible-only visuals and original audio → independent two-device/security/Play readiness gate. LW-E social learning and pet friendships; LW-F sleep, furniture, seasons, birthdays and earned-token shop are deferred post-release candidates.

**New accepted backlog (2026-11-10, not implemented):** T16—remember opted-in local GGUF choices and make safe, optional auto-redownload after a JSON Restore (with optional offline GGUF export/import); T17—spontaneous opt-in two-owner mini-LLM pet dialogues during authorized home visits or shared playground sessions. See [model restore and autonomous dialogue contract](docs/LW_MODEL_RESTORE_AND_PET_DIALOGUE_BACKLOG.md). Keep phase gates sequential; no background inference or cellular data use without explicit permission.

**Do not start LW-B before LW-A is accepted.** A green GitHub workflow or a paid Play developer account alone is not approval to publish. The existing [1.5.6-F release gate](docs/V1.5.6_F_RELEASE_GATE.md) still blocks public release until its owner/device/privacy/restore checks are closed.

## Current baseline & release gates

| Version / phase | State | Deliverable | Gate before next phase |
|---|---|---|---|
| 1.4.1 | Existing `main` baseline at roadmap authoring | Long play, Android debug, mini offline LLM | Existing regression suite |
| 1.5.0–1.5.2 | Developed on feature branches | 2.5D fauna, audio/media, eye blinking repair | UI and physical device |
| 1.5.3 | Android SDK 36 branch, device-tested by owner | API 36, build tools, compatibility | Android 16 smoke test |
| 1.5.4 | Google Play Games beta with successful CI, Play Console NOT configured | Optional sign-in, achievements, boards, Cloud Save/Restore | Real OAuth and Saved Games on devices before calling PGS production-ready |
| **1.5.5** | **Merged into main (debug beta; physical QA pending)** | Mnemoss intelligence, opt-in advanced local model, intro/tutorial, system and manual theme, 17-language architecture and locale selection | JS tests, Android APK, new/old save migration, phone battery/RAM, accessibility, translation audit |
| 1.5.5 QA/RC | Future, requires review | On-device test rounds and bug fixes | No data loss, crashes or blocker bugs; human review |
| **1.5.6-A** | **Merged in main; private Ubuntu health check confirmed by owner** | Privacy/earnability charter, Ubuntu Docker+Postgres localhost scaffold, social spec and tests | Server contract CI, no public endpoints, NAS isolation verified |
| **1.5.6-B** | **Merged; Android CI PASS; physical acceptance pending** | Consent-based server identity, one-use friend invites, Android share/open, block/remove, optional two-sided-confirmation Nearby; social OFF by default | HTTPS on Ubuntu, two physical phones, Nearby permission/reconnect checks |
| **1.5.6-C** | **Source/automated beta; owner Android QA pending** | Six animated learned skills, offline solo playground, two starter toys, earned unlocks, interactive puzzles/dialogue | Old save migration, Android portrait/landscape/reduced-motion and XP economy review |
| **1.5.6-D** | **Implemented in source; CI and physical device gate required** | Consent-based shared playground, room owner/member permissions, server-authoritative earned upgrades, visits to homes/groups, WSS synchronization | DB migration on home Ubuntu, two phones over private HTTPS, block/return/energy/visual QA |
| **1.5.6-E** | **Code + automated beta; real FCM/2-phone gate pending** | Friend-only preset phrase cards, encrypted short messages, event inbox, report/mute/delete and consent-based FCM | Private Ubuntu 005 migration, actual FCM setup + Android/child safety review |
| **1.5.6-F** | **RC1 source/tests; physical & independent acceptance BLOCKED** | 1.5.6-rc1 Android debug APK, versionCode 23, safe queued save/restore, privacy/manifest review, explicit manual QA matrix | 2-phone, NAS backup/restore, Firebase consent delivery, privacy/accessibility audit, owner signoff before final 1.5.6 |
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
- [x] 1.5.6-B source core: auth, one-use invitation API, Android Keystore + deep link and sharesheet; no default public network.
- [x] 1.5.6-B native Nearby opt-in + matching device digits and runtime permission prompts implemented; Android CI green.
- [ ] 1.5.6-B physical two-phone HTTPS and Nearby QA (not yet verified), home server migration and public-edge threat model.
- [x] 1.5.6-C coded six-skill actions, local canvas playground and retroactive save tests; CI and Android QA gate separate.
- [ ] 1.5.6-C real device animation, performance, economy, reduced-motion, backup/restore verification.
- [x] 1.5.6-D implemented shared rooms, membership consent, server-earned effort ledger, atomic upgrades, visits and WSS sync in private gated source.
- [ ] 1.5.6-D real two-phone/private HTTPS acceptance and PostgreSQL 004 migration/restore on Ubuntu; not production ready.
- [x] 1.5.6-E source: encrypted, 7-day friend/event cards; report/mute/block cleanup; FCM opt-in off by default, native generic payload and token revocation.
- [ ] 1.5.6-E server 005 migration, real Firebase device push/rotation/opt-out, age-appropriate free-text review and privacy/data-safety audit.
- [x] 1.5.6-F automated privacy/Android/DB/source gates and safe save/restore concurrency test in beta source; a versioned **1.5.6-rc1** debug APK is built for private testing.
- [ ] 1.5.6-F real two-phone testing, server backup/restore rehearsal, Firebase notification opt-in/rotation/opt-out, localization/accessibility, battery and independent audit; **public release BLOCKED**.

**1.5.6-B authoritative sources:** [Friends protocol, UX and pending gates](docs/V1.5.6_B_FRIENDS.md) · [Existing Ubuntu migration instructions](docs/V1.5.6_B_SERVER_MIGRATION.md). No published Google Play or active payments.

**1.5.6-C documentation:** [Animated skills & offline Playground](docs/V1.5.6_C_PLAYGROUND.md). No multiplayer pet visits or push until 1.5.6-D/E; no Play Store 1.5.6 release before physical QA.

**1.5.6-D evidence and rollout:** [Shared Playground beta design and gates](docs/V1.5.6_D_SHARED_PLAYGROUND.md) · [existing Ubuntu data-safe migration](docs/V1.5.6_D_SERVER_MIGRATION.md). No external ads or automatic public server exposure.

**1.5.6-E:** [Private messaging and opt-in push contract](docs/V1.5.6_E_MESSAGES_PUSH.md) · [Existing Ubuntu SQL 005 & Firebase operator guide](docs/V1.5.6_E_SERVER_MIGRATION.md). FCM and free text stay OFF until independently configured and verified.

**1.5.6-F owner signoff and blocker table:** [Release gate and audited automation/manual matrix](docs/V1.5.6_F_RELEASE_GATE.md). A green CI is source evidence only, not a production certification. Before installing RC1, back up existing local world and beware changed debug signing keys.

**1.5.6-F staging HTTPS for the user-reported public API:** [No-IP / Caddy deployment guide](docs/V1.5.6_F_HTTPS_DEPLOYMENT.md) · [final audit and external gates](docs/V1.5.6_F_ACCEPTANCE.md). Current `http://dedopero.servegame.com:8787` is NOT suitable for sending social bearer tokens. Public version remains on HOLD until verified HTTPS and device/DB checks.
