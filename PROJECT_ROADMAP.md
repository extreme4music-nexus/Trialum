> **OWNER UPDATE — 11 NOV 2026 (SUPERSEDES EARLIER "FIRST SignQA" HANDOFF):** The owner explicitly confirms the previous signing/SignQA step is complete and orders **LW-A completion without redoing it**. The missing LW-A local session expiry and all-pet shared lease renewal are implemented for source review on `feature/trialum-1.6-lw-a-session-lifecycle-20261111`, with deterministic client and disposable-DB regression additions. **Status: IN_PROGRESS / CI + review pending**, not owner-accepted or publicly released. Preserve owner-held signer continuity. No LW-B, installation changes or production DB changes.

> **NEXT SESSION HANDOFF — 11 Nov 2026 (OWNER-ORDERED):** **FIRST** independently check/install the **signed `Trialum-1.6-LW-signqa-SIGNED-CANDIDATE.apk`** on Galaxy A55, then Restore a **COPY** of a verified JSON backup inside `com.trialum.ziivaiskra.signqa` and compare pets/habitats/XP/achievements; confirm the existing main and historical `.lwa` worlds remain untouched. **THEN** resume **only** LW-A session lifecycle/expiry (still **NOT IMPLEMENTED**). Both owner-held signing keys and GitHub Actions APK signing are now **PASS** in [run #42924886058](https://github.com/extreme4music-nexus/Trialum/actions/runs/42924886058); `main` Release APK must **never** overwrite the debug-signed v1.5.6 app. No public launch, Play release or LW-B work. **Read [11 November handoff](docs/TRIALUM_1.6_LW_HANDOFF_2026-11-11.md) before starting.**

> **CURRENT DEVELOPMENT SERIES — TRIALUM 1.6-LW (10 Nov 2026):** 1.5.5 and 1.5.6 are officially CLOSED in their owner-approved feature scope. Recovered LW-A and the native non-overwriting backup vault are merged into main (PR #21). New development is only 1.6-LW-A to 1.6-LW-F, in order. LW-A is still OPEN for unimplemented session lifecycle/expiry. Historical 1.5.6-F APKs are archived; public Play release remains on HOLD. [1.6-LW baseline](docs/TRIALUM_1.6_LW_BASELINE.md).

> **PERMANENT ANDROID SIGNATURE RULE — 11 NOV 2026:** All **installable** Android APK candidates must be signed only by the owner-held permanent key for their package ID via GitHub Actions, with certificate SHA-256 pinned and checked; **no runner-debug APK downloads or unintended signer rotation**. Main package uses Release; independent `.signqa` uses its own stable QA identity. Each future version of a given package MUST keep the same cert and increase `versionCode`. Earlier debug-signed main/`.lwa` remain untouched. [Policy](docs/TRIALUM_ANDROID_SIGNING_CONTINUITY_POLICY.md).

> **OWNER-FRIENDS TESTING — 11 NOV 2026:** Add independent `.signdebug` (debuggable) and existing `.signqa` (non-debuggable), both using **the same permanent QA certificate and same Friends HTTPS server**, while retaining separate package IDs, secure social identities and saved worlds. `versionCode 25` / `1.6-LW-dev.2` upgrade, still owner-only GitHub signing and no public distribution. Use the two apps on Galaxy A55 for friendship/invite, shared-playground and LW-A testing without remote participant delays. [Self-test instructions](docs/TRIALUM_SELF_TEST_FRIENDS_SIGNED_APKS_20261111.md).

# TRIALUM — PROJECT ROADMAP · 2026–2028+

> **LATEST OWNER QA STATUS — 10 Nov 2026:** [Canonical owner confirmations and pending work](docs/OWNER_QA_STATUS_2026-11-10.md). This newer status takes precedence over older 'physical QA pending' descriptions below where the owner has now confirmed a test. In particular: all three local LLM tiers physically work; 1.5.5 theme and English development scope are now closed; wider device QA is future publication work; emotion UI is deferred to LW; the 1.5.6 server is owner-confirmed functional while production/beta are intentionally on hold; LW-A duplicate-presence prevention passes on app and server; safe return home and post-outage recovery are OWNER PASS; session lifecycle/expiry is NOT IMPLEMENTED. **Do not mistake owner functional PASS for independent audit or public release approval.**

> Canonical development roadmap. Updated 9 November 2026 for **1.5.6-A–F source beta and release acceptance matrix**. Every release must pass its own test gate before merging to `main`. Developer builds are NOT Play Store releases. No hidden paid features, background LLM downloads, or mandatory Google sign-in.

**Owner's latest feature acceptance and exact remaining work:** [10 November decisions](docs/OWNER_SCOPE_DECISIONS_2026-11-10.md) · [Closeout ledger](docs/V1.5.5_V1.5.6_CLOSEOUT_2026-11-10.md). Every future text change must update English translation and its tests in the **same change**; the other 15 language packs are deferred to milestone boundaries after LW.

## Mandatory gate before LW-A sessions: durable Android signing

**Owner decision 10 Nov 2026:** first implement and verify permanently controlled APK signing through GitHub Actions, with independent developer/QA identities, no data loss and no Google Play account required for APK signing. **LW-A feature implementation is PAUSED until the signing gates and owner approval pass.** Follow [Official Trialum 1.6-LW Signing Master Plan](docs/TRIALUM_1.6_LW_ANDROID_SIGNING_MASTER_PLAN.md): inspect installed debug certificates/backup files first; create owner-held signing keys; use protected GitHub secrets and manual CI; verify signer SHA-256 and device update/coexistence without overwriting saved worlds. Signing is NOT publication or Google Developer Verification.

## Active development: 1.6-LW (Living World)

Trialum has left the 1.5 development line. [1.6-LW is the next program](docs/TRIALUM_1.6_LW_BASELINE.md), on branch `feature/trialum-1.6-lw`. LW-A source is already in main but the phase is incomplete because sessions remain unimplemented. Keep all source features, native backup rescue, two Android package variants, English sync and CI. Remaining LW phases proceed one at a time, with separate owner acceptance. Do not treat the old 1.5.6-F test artifact name as the new development version.

## Trialum Living World — canonical milestones (10 Nov 2026)

**[Read the full 15-proposal LW-A–F roadmap](docs/TRIALUM_LIVING_WORLD_ROADMAP_2026.md)**. The prior separate documentation branch is preserved as history; the canonical plan is now on `main`. Original T01–T15 tester requests are tracked exactly once. N16 is an occasional consent-based small-LLM dialogue between pets sharing a habitat or playground (future LW-E); N17 is safe re-download of previously consented local models after restored backups (1.5.5/1.5.6 completion backlog). Neither is claimed implemented.

**Historical priority (SUPERSEDED by 1.6-LW):** finish **155-04 theme** + **155-05 missing English strings**; 155-03 partial accepted into LW, 155-06 translations postponed until milestone transitions after LW, 155-07 legacy Backup/Restore owner PASS; **1.5.6-B–F owner accepted as-is for current private feature scope** (publication audits remain separate) → then **resume LW-A** (missing sessions) → LW-B home/playground separation → LW-C autonomous solo playground → LW-D audiovisual polish → LW-E social learning → LW-F broader life simulation. **No LW code work until 1.5.5 and 1.5.6 are closed.** Preserve Play Console/public-beta release hold until separately authorized. A future owner discussion about game direction comes *after* those two versions, not as a substitute for their acceptance evidence.

See [owner-verified facts and precise pending checks](docs/OWNER_QA_STATUS_2026-11-10.md). A server functional PASS does not prove FCM, real two-phone results or independent production sign-off.

## Current baseline & release gates

| Version / phase | State | Deliverable | Gate before next phase |
|---|---|---|---|
| 1.4.1 | Existing `main` baseline at roadmap authoring | Long play, Android debug, mini offline LLM | Existing regression suite |
| 1.5.0–1.5.2 | Developed on feature branches | 2.5D fauna, audio/media, eye blinking repair | UI and physical device |
| 1.5.3 | Android SDK 36 branch, device-tested by owner | API 36, build tools, compatibility | Android 16 smoke test |
| 1.5.4 | Google Play Games beta with successful CI, Play Console NOT configured | Optional sign-in, achievements, boards, Cloud Save/Restore | Real OAuth and Saved Games on devices before calling PGS production-ready |
| **1.5.5** | **OFFICIALLY CLOSED — owner-approved feature scope, 10 Nov 2026** | Mnemoss intelligence, opt-in advanced local model, intro/tutorial, system and manual theme, 17-language architecture and locale selection | JS tests, Android APK, new/old save migration, phone battery/RAM, accessibility, translation audit |
| 1.5.5 QA/RC | Future, requires review | On-device test rounds and bug fixes | No data loss, crashes or blocker bugs; human review |
| **1.5.6-A** | **Merged in main; private Ubuntu health check confirmed by owner** | Privacy/earnability charter, Ubuntu Docker+Postgres localhost scaffold, social spec and tests | Server contract CI, no public endpoints, NAS isolation verified |
| **1.5.6-B** | **OWNER ACCEPTED AS-IS** | Consent-based server identity, one-use friend invites, Android share/open, block/remove, optional two-sided-confirmation Nearby; social OFF by default | HTTPS on Ubuntu, two physical phones, Nearby permission/reconnect checks |
| **1.5.6-C** | **OWNER ACCEPTED AS-IS** | Six animated learned skills, offline solo playground, two starter toys, earned unlocks, interactive puzzles/dialogue | Old save migration, Android portrait/landscape/reduced-motion and XP economy review |
| **1.5.6-D** | **OWNER ACCEPTED AS-IS** | Consent-based shared playground, room owner/member permissions, server-authoritative earned upgrades, visits to homes/groups, WSS synchronization | DB migration on home Ubuntu, two phones over private HTTPS, block/return/energy/visual QA |
| **1.5.6-E** | **OWNER FUNCTIONAL PASS / ACCEPTED AS-IS** | Friend-only preset phrase cards, encrypted short messages, event inbox, report/mute/delete and consent-based FCM | Private Ubuntu 005 migration, actual FCM setup + Android/child safety review |
| **1.5.6-F** | **OFFICIALLY CLOSED — feature scope; public external audits on hold** | 1.5.6-rc1 Android debug APK, versionCode 23, safe queued save/restore, privacy/manifest review, explicit manual QA matrix | 2-phone, NAS backup/restore, Firebase consent delivery, privacy/accessibility audit, owner signoff before final 1.5.6 |
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
7. Owner has accepted 1.5.6-B–F as currently implemented for private feature scope; finish 1.5.5 appearance + English before moving forward. Independent security/device checks still gate *public publication*, not owner feature acceptance.
8. No external ads, advertising SDKs, data brokerage or selling user data. No coercive monetization: future purchasable gameplay advantages are earnable by reasonable normal play and Play Billing/verification is deferred.
9. Privacy and NAS safety: isolate social backend, pseudonymous opt-in accounts, minimal data required for messages/visits, deletion/export, WireGuard-only admin, no public Webmin or Postgres, no hosted user-data dashboards or tracking.
10. All docs in root and `docs/` must describe the actual implementation and clearly distinguish proven tests from unverified Android device results.

## Acceptance checklist: 1.5.5

- [ ] Advanced local GGUF tier is **real**, not a placeholder; optional consent, checksums, graceful RAM/storage failure, no remote prompts.
- [ ] Bounded personality/memory privacy and persistence validated for 1.5.5; **visible emotional expressions/expanded behavior are deferred to LW**, so do not mislabel them as shipped or block 1.5.5 on that deferred scope.
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

**Historical scope of 1.5.6-A at initial design time (subphases A–F have since reached source RC1; do not treat this line as current status).** Full scope:
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
