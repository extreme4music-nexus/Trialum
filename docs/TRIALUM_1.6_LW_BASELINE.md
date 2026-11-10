# TRIALUM 1.6-LW — new development line

**Owner decision: 10 November 2026.** Trialum has formally **closed the 1.5 development line** for the owner-approved feature scope. The next development series is **1.6-LW (Living World)**. This is a *new development milestone*, not an already tested public release and not a rename of the historical 1.5.6-F archive.

## Boundary between versions

- **1.5.5 and 1.5.6:** frozen/closed in the owner's agreed feature scope, including 155-03 accepted partially into future LW, light theme and English localization completed to current owner-approved scope, 15 additional languages deferred until milestone reviews after LW, local Backup/Restore accepted, 156-B–F accepted as-is. Preserve existing docs, test evidence, release audit and historical tags. No retroactive fake certification.
- **1.6-LW:** sole new feature development stream. LW-A → LW-B → LW-C → LW-D → LW-E → LW-F sequentially under [Living World roadmap](TRIALUM_LIVING_WORLD_ROADMAP_2026.md). The 15 original tester proposals T01–T15 and additional N16/N17 are preserved intact; do not relabel accepted 1.5.6 features as outstanding work.
- **1.6-LW initial source baseline:** LW-A recovery merged into `main` in PR #21, merge commit `6c90b0bfa54b53d2c1c6e1ecfcd32523a3025768`, verified twin Android APK CI at source commit `20ae57f3e6fe5b7115631999b8accf2f19ebf782`.
- **LW-A scope:** single pet location source of truth, home/solo/shared/visit semantics, safe server lease reconciliation and non-overwriting verified native backup vault already implemented/partly owner-tested. **Missing session lifecycle/expiry is NOT IMPLEMENTED and LW-A is still OPEN**; do not claim LW-A completed just because its source was merged.
- **New working branch:** `feature/trialum-1.6-lw` from latest `main`; release/application version labels in the *development branch* must use `1.6-LW` and have a monotonically higher Android versionCode. Legacy historical archive and developer APKs from 1.5.6 are never overwritten/renamed.

## Android development build identities (1.6-LW branch only)

The archived `1.5.6-rc1` build and its artifacts remain intact in GitHub history. Following owner approval and green twin-APK/server CI, the new `1.6-LW` development identity was merged into `main` via [PR #22](https://github.com/extreme4music-nexus/Trialum/pull/22), merge commit `a3c7c740cdc4e595c071fa3de79c233cb952707b`. `main` and `feature/trialum-1.6-lw` now use `versionCode 24` and `versionName 1.6-LW-dev.1` (**development**, not a public release). [Dual Android CI](https://github.com/extreme4music-nexus/Trialum/actions/runs/42903151143) and [server security CI](https://github.com/extreme4music-nexus/Trialum/actions/runs/42903151151) both passed on development commit `5b547d6b08f1adcf1d05266864008a24b6686efa`.

- **Normal developer APK:** `com.trialum.ziivaiskra`; artifact `Trialum-Android-1.6-LW-dev-debug`. **DO NOT install as an update over an important existing world without same signing certificate and verified backup**.
- **New isolated 1.6-LW test APK:** `com.trialum.ziivaiskra.lw16`; artifact `Trialum-1.6-LW-Isolated-Test-APK`; display label **Trialum 1.6-LW Test**. It has its own storage, Android Keystore, non-overwriting backup vault, deep-link scheme and package UID. It can coexist with **both** the original package and the historical `com.trialum.ziivaiskra.lwa` parallel test package. Do not replace either.
- Historical `assembleLwa` is retained for provenance, but the new workflow builds `assembleLw16` (while also building normal debug). This is a development packaging migration, **not a migration of anyone's stored progress**.
- APK labels and version numbers **must not** be interpreted as official Play Store release authorization. For any real save/restore check, work only with copied external JSON files in the isolated package.

## Critical non-regression gates

1. No loss of pets, four habitats, XP, achievements, logs, save slots, model unlocks, offline play, consent or friends. No background download without opt-in.
2. Maintain `TrialumBackupVault.kt`: distinct SHA-256 read-back verified JSON files under Downloads/Trialum, pinned pre-restore/reset rescue, fail-closed destructive operations, error reporting and 20 retained rescue entries. Never revert to the older Android file picker that could overwrite a previous save.
3. Maintain two independent test package variants when needed. The isolated `.lwa` package never replaces normal `com.trialum.ziivaiskra` and has a separate keystore/backup store. Do not uninstall or clear data; Android debug signing compatibility must be checked before any upgrade.
4. Keep nightly/PR JS, Android SDK 36 and server security integration tests; tests for `js/presence.js`, `server/src/presence.mjs`, export/restore and legacy world migrations must continue passing. Independent phone restore tests remain separate and explicitly unverified where not reported.
5. Any new user-visible string must synchronize with `locales/en.json` in that same change. 15 other language packs: milestone review *after* Living World completion, as owner decided.
6. Owner requested **slow, gated releases**, no Google Play Console/public-beta submissions without a later explicit decision, no production Ubuntu server/Caddy/NAS/secrets changes as a side effect of renaming the milestone. Future discussion about Trialum's long-term direction stays reserved for the owner.

## Status language

**1.5.5 = CLOSED (owner-approved development scope)**  
**1.5.6 = CLOSED (owner-approved development scope)**  
**1.6-LW = ACTIVE DEVELOPMENT SERIES**  
**1.6-LW-A = SOURCE PARTIAL, OWNER PRESENCE/RETURN/RECONNECT PASS, SESSION LIFECYCLE OPEN**  
**1.6-LW-B–F = PLANNED, sequential and not yet accepted**  
**Play Store release = HOLD (future independent testing and owner authorization)**

Historical docs about `1.5.6-F` refer to legacy RC builds and are preserved for provenance, not the name of future LW APKs.
