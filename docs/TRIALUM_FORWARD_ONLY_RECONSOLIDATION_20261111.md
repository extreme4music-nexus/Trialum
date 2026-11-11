# TRIALUM — 1.5.5 / 1.5.6 → 1.6-LW forward-only reconsolidation

**Date:** 11 November 2026  
**Work branch:** `reconsolidation/lw-forward-only-155-156-20261111`  
**Starting point:** `main` SHA `3991b9abbf09...` (after pinned, signed v25 Android artifacts were committed)  
**Authority:** owner's explicit instruction: every *previously closed and genuinely confirmed* feature must survive the 1.5.5 → 1.5.6 → LW transition; verify branch code and evidence before controlled integration. **Do not merge to main until review and owner confirmation.** Main Android auto-signing is already enabled; a merge will trigger a new owner-key signed APK build.

## 1. Branch inventory and decision

The inspected repository has **35 named branches** (including `main`). Historical PRs #1–#29 are a mixture of merged, superseded and unmerged work. The important outcomes are below; do not use a historical branch name as proof of an accepted or correct implementation.

| Historical branch / PR | Outcome vs current LW source | Action |
|---|---|---|
| `feature/trialum-v1.5.5-intelligence-accessibility` (#7, merged) | Ancestor of main; original Mnemos, three local model tiers, themes/17 language choices, onboarding and backup code are still present. | Lock owner-confirmed tiers, existing theme, onboarding and backup through cumulative regression contracts; **not** emotional expression or complete 15 other languages |
| `fix/trialum-v155-theme-en-closeout-20261110` (#20, closed **unmerged**) | Main `assets/style.css`, `js/theme.js` and `tests/theme-preview.html` are byte-identical to this branch; English exact entries on this branch already exist in main. | No wholesale cherry-pick; preserve theme code, English audit, source tests and owner-accepted scope |
| `feature/trialum-1.5.6-en-tester-20261109` (**unmerged branch**) | Exact English catalog had **178 keys absent from main**; source scan of 14 active JS/HTML modules located **163 missing keys still referenced in current code**. The main catalog had 512 exact `strings` and the old tester branch had 595, with many independently added keys in each. Old Android tester used English-only native literal substitutions rather than a properly bilingual native locale implementation. | **Restored all 178 missing non-Cyrillic exact English translations additively, without overwriting current ones.** Catalog now has **690 exact strings and 985 word fallbacks**. Added immutable historical-key baseline and runtime translation protection for invitation share sheets. Native Android language coverage remains an explicit separate review item |
| `feature/trialum-v1.5.6-b-friends` (#9), `feature/trialum-1.5.6-b-nearby-acceptance` (#10) | Merged, owner feature-scope accepted. Actual `js/social.js`, Android Nearby, social tests, current Friends HTTPS variable and pinned signer checks exist. | Preserve with accepted feature contract; protect independently installed QA vs Friends Debug and private server endpoint |
| `feature/trialum-1.5.6-c-skills-playground` (#11) | Merged; six play toys/skills and offline playground modules persist. | Lock six toy IDs and previously accepted scope |
| `feature/trialum-v1.5.6-d-shared-playground` (#12, merged) | Current server and client restructured into `shared-playground.js`, `server/src/shared.mjs`, `presence.mjs`, `live.mjs`; tests exist. | Preserve accepted scope; no speculative copy of obsolete schema/API |
| `feature/trialum-1.5.6-d-shared-playground` (#13, **open/unmerged**, different branch from #12) | Contains an earlier `js/shared.js` / different server API/SQL plus member revocation, WebSocket reauthorization, animated shared stages. Current main has modern revocation (presence-aware delete), `roomFor` auth on room broadcasts, and a newer shared scene; not safely cherry-pick compatible. | Compare the **behavior**, not file names. Keep current implementation; highlight any uncovered visual/member-revocation edge cases in ongoing independent review, do not run obsolete SQL on the production server |
| `feature/trialum-v1.5.6-e-messages-push` (#14) | Merged; messages, opt-in push and tests retained. | Lock owner-confirmed private functional scope, but **not** claim full physical FCM/security certification |
| `feature/trialum-v1.5.6-f-release-gates` (#15/#16) | Merged, source acceptance and regression gates present. | Preserve tests and privacy/saved-world checks |
| `feature/trialum-v1.5.6-f-qa-security-hardening` (**unmerged**) | Several native **WebView origin/file/mixed-content restrictions** and `TrialumPush.opted` requiring active device-bound social credential were **missing in current main**. Android Auto Backup identity/consent exclusions were already present. | **Recovered missing hardening** in `MainActivity.kt` and `TrialumPush.kt` without reverting current modern native backup/FCM code. Added permanent source contract checks |
| `recovery/lw-a-preserved-plus-theme-en-20261110` (#21), `feature/trialum-1.6-lw` (#22) | Both ancestors of current main; preserved dual-app safe restore/theme/English and 1.6-LW version line. | Never roll back world schema or signer history |
| `feature/trialum-1.6-lw-a-session-lifecycle-20261111` (#26) | Merged, local session expiry and remote renew/reconcile in source and CI PASS. | **LW-A NOT OWNER ACCEPTED** yet. Preserve user-confirmed pet return, no duplicate and network recovery; do not declare LW-A closed solely on source CI |
| Android signing #24/#25, signed Friends server restoration #27, dual QA apps #28, Git artifact publish #29 | All merged; exact stable certificates (Release distinct from QA), Friends HTTPS endpoint embedded in three packages, v25 immutable app IDs and Git artifact sync. | Preserve signer SHA pins and Android data continuity; a future merged code change auto-builds signed APKs **only after all regression checks succeed** |

## 2. Owner-accepted baseline (not re-invented)

Machine-readable feature contract: [`tests/forward-only-baseline.json`](../tests/forward-only-baseline.json). It distinguishes **OWNER PASS**, **OWNER ACCEPTED AS-IS**, **PARTIAL ACCEPTED AS-IS**, **CI PASS NOT OWNER ACCEPTED** and **DEFERRED**, grounded in [owner decisions](OWNER_SCOPE_DECISIONS_2026-11-10.md), [owner QA](OWNER_QA_STATUS_2026-11-10.md), and [closeout](V1.5.5_V1.5.6_CLOSEOUT_2026-11-10.md). An older source or README label alone never establishes real-world owner acceptance.

**Locked for private feature scope:** all three real local GGUF model tiers; learned-skill display (not full emotion display); light/dark/system and persistence; English translations already accepted; 17 language selectors (only MK+EN continuously maintained); local JSON Backup/Restore; Friends/invites/Nearby; six skills/offline playground; shared playground and consent visits; short friend message cards/opt-in notification source; historical 1.5.6-F feature scope/safety guards; LW-A previously owner-tested presence/return/recovery; signed QA and Friends Debug identities.

**Not falsely marked complete:** LW-A new finite session physical acceptance, full native EN on all Android dialogs/notifications, 15 additional languages, rendered emotions/advanced behavior, automatic model binary re-download after Restore (N17), actual multi-device Google Play Games/FCM production verification, public Play release and LW-B–F.

## 3. Concrete fixes in this reconsolidation branch

1. `locales/en.json`: additive recovery of **178** exact historical translations from unmerged English tester branch; preserves all current translations. Active social sharing now uses `TrialumI18n.t` for its **native share-sheet message**, not just DOM replacement, for user-selected English. No personal content is auto-translated.
2. `MainActivity.kt`: restore WebView no-file-URL/universal access, forbid mixed content and multiple windows, Safe Browsing and strict HTTPS asset-loader origin/path checks from the unmerged 1.5.6-F branch.
3. `TrialumPush.kt`: old consent bit alone cannot enable push after lost/recovered social credentials; require valid device-bound credential too.
4. `index.html`: stop advertising `1.5.6 β1` on the current `1.6-LW` screen.
5. `tests/accepted-english-156-archive.json`, `tests/forward-only-baseline.json`, `tests/forward-only.test.cjs`: historical English exact-string key lock, explicit owner-feature source/CI contracts, Android security, native share-string and stable signer/friends checks.
6. `.github/workflows/android-signing.yml`, `build-android.yml`, `english-text-sync.yml`: **fail CI before signing/publishing** if the locked contract disappears. No secrets in PR builds, no auto-deploy and no DB changes.

## 4. Forward-only control policy (effective from this branch)

**Requirement:** A future feature branch cannot be merged into `main` if it silently removes or weakens an accepted feature, its automated guard, the English dictionary baseline, backup invariants, social consent/security or fixed certificate. A deliberate breaking change requires explicit owner authorization, migration/rollback planning, updated acceptance ledger and matching tests *in the same reviewed PR*.

**Controls:**

- Per-feature status/evidence contract, preserved independently from historical branch names and stale roadmap claims.
- Immutable historical exact-English key snapshot: **178 formerly lost phrases must stay available**; future text updates preserve or explicitly migrate accepted keys.
- Mandatory English same-change CI on PR + headless English 16-screen smoke; English catalog count and share-intent output assertions.
- All existing JS simulation/unit/backup/LW-A/privacy/regression suites + Android SDK36 build under the same commit; server contracts and synthetic database tests for any social changes.
- Signer certificate fingerprint and app package identity continuity; no debug-runner distribution. Git-tracked APKs are updated **only** on a successful `main` CI+sign chain, not while reconsolidation is still under review.
- Source tests and simulated CI cannot assert physical-device acceptance: explicitly carry the owner manual gate and real-Friends two-account QA forward until verified.

## 5. Owner acceptance checklist before merge

- Inspect this PR's exact diff and branch-by-branch evidence; do not overwrite main merely because the branch was called `reconsolidation`.
- Confirm all relevant GitHub CI jobs (Android/JS, English sync, social server) PASS on exact source SHA. Any compiler/runtime or contract error must be fixed **in this branch** first.
- Inspect English Friends, share sheet, messages/playground, old backup Restore and System/Light/Dark at least with current Android QA builds; check native Android dialogs separately. Do not uninstall the historical debug-signed main app.
- Explicitly accept or request additional work before merge. Once merged, `main` triggers the existing automatic owner-key signature and Git APK sync. Re-test the two QA packages on device. Do not proceed to LW-B based only on CI.

**Safety:** No production Ubuntu/Postgres/Caddy, GitHub signing secret, NAS backup or Android installed application has been altered by this branch review. Historical accepted worlds/keys must remain intact.
