# Trialum LW-A recovery from the last dual-APK baseline (10 Nov 2026)

## Incident and root cause

The 1.5.5 daylight/English closeout changes were developed from **main**, but the latest verified **LW-A dual-APK branch** had not yet been merged there. A successful build on main did not mean its APK contained LW-A's native backup vault, safe rescue copies, per-pet presence and parallel Android variant. This was a **branch baseline regression**, not a failed user test.

**Gold recovery baseline:** `feature/trialum-lw-a-pet-presence-20261109` at `f7c825fa3af26e459688b56d0486375430f391b6`; [last known dual-APK successful run](https://github.com/extreme4music-nexus/Trialum/actions/runs/42784122267). The recovery branch was created **from that baseline**, not from main. The comparison with `f7c825f` must show only explicitly allowed overlay files; new work may never replace `MainActivity.kt`, `TrialumBackupVault.kt`, `ModelRuntime.kt`, `js/presence.js`, `js/playground.js`, `js/shared-playground.js`, server migrations, or LW-A tests with older main versions.

## Recovered functionality that must remain present

- Native `TrialumBackupVault.kt`: never-overwriting, read-back verified SHA-256 JSON exports under Downloads/Trialum; private rolling and pinned rescue snapshots and in-app rescue listing/restore; mandatory pre-restore/reset protection. Data from private vault does NOT survive uninstall.
- Original 1.5.6-F RC1 feature set: friends/invitations, learned skills, local and shared playground, messages, guarded save/restore and advanced model tiers.
- Complete LW-A per-pet presence and safe local/shared return / reconnection code with server-side optional lease schema, tests, remote authorization and saved-world migration. Owner PASS for return and reconnect; session lifecycle final gate remains separately scoped.
- Correct **two APK outputs from one identical source snapshot**:
  - `Trialum-Android-1.5.6-F-rc1-debug` for original `com.trialum.ziivaiskra` (do not replace an installed app without compatible signing and a verified backup);
  - `Trialum-LW-A-Parallel-Test-APK` for isolated `com.trialum.ziivaiskra.lwa` (separate saved data; ideal for non-destructive acceptance tests).
- Themes System/Light/Dark, refreshed daylight gradient design, and missing English translations copied from the closeout review without replacing LW-A's backup/presence source code.

## Change allowlist compared with golden f7c825f

The recovery overlay may change **only**:
`.github/workflows/build-android.yml`, `assets/style.css`, `js/theme.js`, `js/app.js` (two theme metadata additions only; pinned pre-restore rescue and presence untouched), `locales/en.json`, `tests/version155.test.cjs`, `tests/ui.test.cjs`, `tests/theme-preview.html`, `tests/lw-recovery-regression.test.cjs`, and this recovery incident document. No Android native, server or existing LW-A presence module is changed.

`node tests/lw-recovery-regression.test.cjs` is a deliberately failing guard if any core safety feature or second APK build type disappears. JS/CI tests plus `assembleDebug` and `assembleLwa` run on exact branch SHA.

## Device safety: do not destroy current progress

1. Never uninstall, clear storage, replace APK with an incompatible signing key, or run Restore on the user's valuable installed world as part of this recovery.
2. Keep both the existing original app and the prior LW-A test installation untouched; the two package IDs have **independent WebView data and Android Keystore identities**.
3. Retain all existing external JSON files, old APKs and any 10.38 MiB ADB archive. Make independent copies to safe storage *before* any experiment, then verify file size, JSON contents (pets, day, histories) and checksum.
4. Inspect and test the new `.lwa` APK in a **separate installation**. Use an external **copy** of the known-good JSON, not the only original. Do not assume signing compatibility for the standard package.
5. A branch or APK recovery can restore functionality but **cannot reconstruct unique game history from a previously overwritten 0-byte JSON or uninstalled private data** without an intact copy or vault. Do not promise automatic restoration of unrecoverable bytes.
6. Do not push, migrate or change Ubuntu production data/Caddy/Firebase/ports during source recovery. Never use destructive DB/volume commands.

## Evidence and acceptance gate

- [ ] Recovery CI on exact SHA passes both Android variants, JS/QA tests and recovery invariants.
- [ ] Artifacts listed with precise `Trialum-Android-1.5.6-F-rc1-debug` and `Trialum-LW-A-Parallel-Test-APK` names, compare source and package identifiers.
- [ ] On independent QA package: inspect existing day, four pets, four habitats, credit/XP/log histories (or the owner's actual snapshot), verify safe export twice and two distinct nonzero JSON files.
- [ ] Test pinned rescue on reset/restore and confirm failed backup blocks destructive action; do this only on QA data.
- [ ] Real device theme and English test without changing baseline game mechanics; manual comparison signed off by owner.
- [ ] Only then decide merging to main or publishing a new regular APK. Do not let GitHub green alone authorize replacement of a valuable installed app.

**Current status:** recovery code branch under verification; no claim of phone data restoration, public release, production deployment, LW-A acceptance or independent audit.
