# TRIALUM LW-D — CONTINUE HERE AFTER A CHAT / CODEX SESSION LIMIT
**Updated 2026-11-14.** This file is documentation in `main` only. **LW-D app code is NOT in main.** Read this first in any new session. Owner: extreme4music-nexus. A new assistant should continue development without asking the owner to repeat already-set Firebase, signing, server or QA information.

## EXACT NEXT WORKSPACE (NOT main)
**GitHub repository:** `extreme4music-nexus/Trialum`.
**Active LW-D branch:** `fix/lw-d-dna-classic-parity-20261114`.
**Draft PR #68 (CURRENT):** https://github.com/extreme4music-nexus/Trialum/pull/68
**PR base:** `feature/lw-d-l3-4b-functional-flora-20261114`.
**Previous functional flora PR #67:** https://github.com/extreme4music-nexus/Trialum/pull/67
**Phase evidence (recorded on active branch):** `docs/LW_D_DNA_CLASSIC_PARITY_AUDIT_20261114.md` (full source-to-source parity matrix); previous flora evidence `docs/LW_D_L3_4B_FUNCTIONAL_FLORA_20261114.md`.
**Canonical operating rules (on the branch):** `docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md`.
**Latest QA workflow (on the branch):** `.github/workflows/lw-d-android-qa.yml`.
**Do NOT accidentally use `main` as the source for LW-D work; it does not contain the new 3D laboratories.** Do not copy feature branches out of order or silently merge.

## CURRENT PRIORITY — OWNER-REPORTED 3D DNA VS CLASSIC PARITY GAP
Owner discovered the immersive DNA laboratory omitted Classic features even after prior partial graphics/action PASS. **Do not label the new DNA parity fix OWNER PASS until the owner personally tests it.** New Draft PR #68 on `fix/lw-d-dna-classic-parity-20261114` is the current source of work. It retains fully working food and botanical branches as ancestors, without merging into main.

Mandatory source comparison: `js/expansion-ui.js` Classic DNA editor (hue, 1–5 eyes, four shapes, exact cost) + `js/longplay-ui.js` Classic DNA catalog (all seven advanced lineages, all additionally discovered fauna, description, every `E.longplayRequirements` prerequisite and same-pet `E.longplayTransform`). The new 3D view must support all saved-pet selection, authentic genome/identity/memory/lineage data, per-target resource, source-species and habitat-capacity gates, and holographic (not native Android) selection/Confirm/Cancel. Only original parent engine performs writes; no new game economy, save schema, extra Firebase app or local signer. CI signed `com.trialum.ziivaiskra.signqa` APK is the next owner device test. **Current PR:** https://github.com/extreme4music-nexus/Trialum/pull/68

## DNA PARITY AUTOMATED EVIDENCE — NEWEST OWNER-SIGNED SIGNQA
**GitHub Actions #99 SUCCESS:** https://github.com/extreme4music-nexus/Trialum/actions/runs/43646385492
**Exact tested source SHA:** `3e1509a8bd0bae0a84341e897e2768a5147279dd` (later docs-only commits).
**Installable ZIP:** `Trialum-LW-D-DNA-PARITY-OWNER-SIGNED-SIGNQA-99` (artifact ID `14134057152`, expires 2026-11-28). Extract `Trialum-LW-D-DNA-PARITY-SIGNQA-SIGNED.apk`. Do NOT use UNSIGNED. Tests/Android build/permanent-QA-key v2/v3 signature/pinned certificate PASS; English and social security PR checks PASS. **Physical DNA parity owner acceptance PENDING.**

## OWNER ACCEPTED
- Working LW-D SignQA FCM remote notifications — explicit physical-device OWNER PASS.
- 3D DNA machine actions and graphics (L3.2-B and L3.2-C) — explicit owner passes.
- 3D food room, holographic recipe popups, real production/feeding and animation (L3.3-A/B) — explicit owner passes, most recent L3.3-B described as **“Огромно PASS”**.
- 3D botanical room foundation (L3.4-A), including fourth corridor door, seed-bank, scanner and growth chamber. Owner tested on Galaxy A55 and uploaded `Screen_Recording_20261114_220523_Trialum Signing QA.mp4` (30.216s); reported **“Супер е”** and authorized finishing L3.4-B. No new recording is required merely to accept work. Avoid inventing exact FPS or unreported user test cases.

## FINAL AUTOMATED L3.4-B RELEASE EVIDENCE (NOT OWNER PHONE PASS)
**Signed GitHub Actions #95 (SUCCESS):** https://github.com/extreme4music-nexus/Trialum/actions/runs/43642482023
**Tested source SHA:** `8059fb1afab95465cd0065b6d98aa64bdbbacbd5` (later branch documentation commits only).
**Installable signed artifact:** `Trialum-LW-D-L3-4B-OWNER-SIGNED-SIGNQA-95` (artifact ID `14132991017`), extract `Trialum-LW-D-L3.4B-SIGNQA-SIGNED.apk`. Expires **2026-11-28**. Do NOT install the corresponding UNSIGNED artifact.
**Gates PASS:** functional flora source/engine transactions, older DNA/Food/LW-C/FCM regressions, Android `:app:assembleSignqa`, permanent QA key and pinned SHA256, reviewed English key ledger/translation, social server security. **On-phone owner acceptance is still pending.**

## PREVIOUS L3.4-B MILESTONE (HISTORICAL — awaiting independent owner phone PASS)
In PR #67 implement and verify both real botanical operations in the existing 3D hologram:
- `invent` -> the ORIGINAL `E.inventPlant(s,species)` (12 insight / 7 molecules, research tier/blueprint checks).
- `plant` -> the ORIGINAL `E.plant(s,species)` (C8 N5 P3 O6 and one habitat day action; max 6 plants). The parent **must verify the selected habitat ID** from confirmation before touching game state.
- In-panel holographic Confirm/Cancel (no Android native gray popup), one in-flight operation, trust-window/source-and-origin checking, actual result-based animation and refreshed canonical saved-world inventory, growth, oxygen.
- No new economy, pet, blueprint or backup storage schema. No autogenerated user approval.
- Owner device PASS of L3.4-B is **PENDING until owner explicitly confirms the signed test APK**. Do not claim a green GitHub CI is proof of physical phone behavior.
- After L3.4-B acceptance: start **L3.5-A Research Laboratory** (fifth door) as a new sequential branch. Long-term gameplay redesign is a separate approved data-safe effort; do not mix it into 3D design.

## REQUIRED BUILD + DEVICE CONTRACT
Three existing Android/Firebase identities, no more:
1. `com.trialum.ziivaiskra` — official Release, **Codex only**.
2. `com.trialum.ziivaiskra.signdebug` — FriendsDebug, **Codex only**.
3. `com.trialum.ziivaiskra.signqa` — LW-D SignQA, **this lane**.
FCM configuration is already in GitHub Actions Variables: `TRIALUM_FIREBASE_APP_ID_SIGNQA`, sender/project/API key and HTTPS social URL. Signing keystore and passwords already exist as GitHub Secrets; pinned fingerprint `TRIALUM_QA_CERT_SHA256`. **No new Firebase registration, fourth app ID, local signing, new Secrets or owner reconfiguration.**

The trusted GitHub `.github/workflows/lw-d-android-qa.yml` action alone builds `:app:assembleSignqa`, signs automatically from existing QA Secrets, validates certificate/signature and uploads **OWNER-SIGNED-SIGNQA** artifact. The `UNSIGNED` artifact is NEVER the installable one. Install as an **update** to the existing Signing QA, without uninstalling, resetting the world or clearing data. If the owner reports a blocker, fix in the phase branch, rerun CI, document findings. Do not touch Codex's Release/FriendsDebug, Debian server, Firebase console, Play Console or users' progress.

## SHORT INSTRUCTION FOR ANY NEW ASSISTANT / CODEX INSTANCE
> Open `extreme4music-nexus/Trialum`. Read this main-only handoff, then check out branch `fix/lw-d-dna-classic-parity-20261114`, inspect Draft PR #68 and its exact latest GitHub Actions logs, plus `docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md`. Match every item against the original Classic DNA implementations, run all DNA parity / old food / flora / LW-C / FCM tests and build the owner-signed SignQA APK with existing GitHub QA Secrets. Do **not** ask the owner to configure FCM or signing again, never merge into main, beta or Codex lanes without explicit approval. Current next goal is the DNA parity phone QA; after owner PASS and when owner authorizes, continue the remaining fifth Research Laboratory. Preserve existing owner-accepted changes.

**This main file is a navigation pointer, not a claim that main contains LW-D 3D code or that DNA parity/L3.4-B has received physical owner acceptance.**
