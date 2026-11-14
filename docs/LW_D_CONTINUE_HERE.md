# TRIALUM LW-D — CONTINUE HERE AFTER A CHAT / CODEX SESSION LIMIT
**Updated 2026-11-14.** This file is documentation in `main` only. **LW-D app code is NOT in main.** Read this first in any new session. Owner: extreme4music-nexus. A new assistant should continue development without asking the owner to repeat already-set Firebase, signing, server or QA information.

## EXACT NEXT WORKSPACE (NOT main)
**GitHub repository:** `extreme4music-nexus/Trialum`.
**Active LW-D branch:** `feature/lw-d-l3-6-lobby-entry-polish-20261114`.
**Draft PR #70 (CURRENT):** https://github.com/extreme4music-nexus/Trialum/pull/70
**PR base:** `feature/lw-d-l3-5-research-complete-20261114`.
**Previous owner-accepted Research fifth-door PR #69:** https://github.com/extreme4music-nexus/Trialum/pull/69 (its owner-approved predecessor: DNA parity PR #68)
**Phase evidence (on active branch):** `docs/LW_D_L3_6_MAIN_LOBBY_OWNER_QA_20261114.md` (owner lobby-first requirement + regression/visual QA), previous `docs/LW_D_L3_5_RESEARCH_CLASSIC_PARITY_20261114.md` (fifth door, owner accepted), `docs/LW_D_DNA_CLASSIC_PARITY_AUDIT_20261114.md` (DNA audit), plus prior Flora phase.
**Canonical operating rules (on the branch):** `docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md`.
**Latest QA workflow (on the branch):** `.github/workflows/lw-d-android-qa.yml`.
**Do NOT accidentally use `main` as the source for LW-D work; it does not contain the new 3D laboratories.** Do not copy feature branches out of order or silently merge.

## CURRENT PRIORITY — L3.6 CENTRAL MAIN LOBBY + QUALITY POLISH
Owner physically tested fifth Research Laboratory and stated **“Супер. Имаш еден огромен пасс.”** **L3.5 OWNER PASS CONFIRMED**. Owner then required the hallway/corridor to be the **MAIN LOBBY** of the entire five-room 3D laboratory complex, so every first entry/reentry opens the corridor and all five functional rooms are accessible ONLY FROM THE LOBBY (Basic Lab is also a room, never the default screen). Combine with next graphics/animation/deeper saved-world link step. Previous DNA/Food/Flora/Research functions, FCM and social must remain intact.

**Current branch:** `feature/lw-d-l3-6-lobby-entry-polish-20261114` — **Draft PR #70:** https://github.com/extreme4music-nexus/Trialum/pull/70. Single source of truth: `TrialumLabComplex.INITIAL_VIEW="hub"`, consumed by renderer/HUD; Lab dock and Atlas return to hub; no automatic Basic-room jump after experiments. New 3D lobby has moving ceiling haloes, light pathways to all doors, resource-reactive state indicators (REAL pet/biomass/compound/insight projections), MK/EN responsive hologram and entry animation. Visual code never generates money/progress, saves, AI or background ticks.

**NEXT:** check newest GitHub Actions for the signed L3.6 SignQA build, fix any source/Android/regression error, verify owner QA-key signature and deliver exact installable signed artifact for phone testing. Mark L3.6 OWNER PASS only after explicit owner's on-device confirmation. **Do not merge into main**, or alter Play, Release, FriendsDebug, backend, existing GitHub Secrets or Firebase registration. Full phase evidence: `docs/LW_D_L3_6_MAIN_LOBBY_OWNER_QA_20261114.md`.

## VERIFIED HISTORICAL L3.5 RESEARCH SIGNQA BUILD — OWNER PASSED
**[GitHub Actions run #43648592600](https://github.com/extreme4music-nexus/Trialum/actions/runs/43648592600), run #105 SUCCESS**: all four original research engine operations, full Classic Research UI requirements, five doors/geometry/camera, previous DNA/food/flora/LW-C/FCM tests, Android SignQA compile and GitHub owner-only QA signing with pinned certificate PASS.
**Exact tested source SHA:** `58ba8a85c44290d702d7a56c4b70747953c3f991`. The branch's subsequent changes were documentation only.
**INSTALLABLE signed artifact:** `Trialum-LW-D-L3-5-OWNER-SIGNED-SIGNQA-105`, artifact ID `14134289630`, expires **2026-11-28**. Extract `Trialum-LW-D-L3-5-SIGNQA-SIGNED.apk` and **update** existing SignQA app without uninstalling or clearing data. Do NOT install `Trialum-LW-D-L3-5-SIGNQA-UNSIGNED-105`.
**Physical owner L3.5 QA: OWNER PASS CONFIRMED (2026-11-14).** User tested and accepted it; L3.6 lobby successor acceptance remains pending.

## DNA PARITY AUTOMATED EVIDENCE — NEWEST OWNER-SIGNED SIGNQA
**GitHub Actions #99 SUCCESS:** https://github.com/extreme4music-nexus/Trialum/actions/runs/43646385492
**Exact tested source SHA:** `3e1509a8bd0bae0a84341e897e2768a5147279dd` (later docs-only commits).
**Installable ZIP:** `Trialum-LW-D-DNA-PARITY-OWNER-SIGNED-SIGNQA-99` (artifact ID `14134057152`, expires 2026-11-28). Extract `Trialum-LW-D-DNA-PARITY-SIGNQA-SIGNED.apk`. Do NOT use UNSIGNED. Tests/Android build/permanent-QA-key v2/v3 signature/pinned certificate PASS; English and social security PR checks PASS. **Physical DNA parity OWNER PASS CONFIRMED (2026-11-14); owner then authorized the fifth Research door.**

## OWNER ACCEPTED
- **L3.5 fifth 3D Research Laboratory** — owner explicitly tested and stated “еден огромен пасс” on 2026-11-14. Next request is L3.6 lobby-first routing.
- **DNA Classic parity** — explicit on-device OWNER PASS on 2026-11-14; corrected all saved-pet selection, lineage conditions and holographic DNA functions.
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
> Open `extreme4music-nexus/Trialum`. Read this main-only handoff, then CHECK OUT `feature/lw-d-l3-6-lobby-entry-polish-20261114` (not `main`), inspect Draft PR #70, `docs/LW_D_L3_6_MAIN_LOBBY_OWNER_QA_20261114.md` and canonical operating rules. OWNER PASSED prior L3.5 Research. Current L3.6 must open central lobby FIRST and route to all five rooms without skipping to Basic; maintain decorative light effects tied to real saved-world stats but NO gameplay mutation. Check latest CI, fix regressions, build ONLY owner-signed existing GitHub QA `com.trialum.ziivaiskra.signqa`, provide exact artifact for on-phone testing. No new Firebase keys/apps, local signing, main merges, Release/FriendsDebug/Play/backend changes. After owner explicitly approves L3.6, document status and only then discuss next visual/gameplay evolution plan.

**This main file is a navigation pointer only: main contains NO LW-D 3D implementation; DNA parity and Research L3.5 have OWNER PASS. L3.6 lobby physical acceptance (and any separate Flora L3.4-B test cases not independently reported) remains PENDING.**
