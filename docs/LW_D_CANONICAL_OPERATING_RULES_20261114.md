> **TOP PRIORITY — OWNER B1 REWORK; NOT A PASS (15 NOV 2026):** The user reviewed the signed B1 Galaxy A55 video and explicitly ordered NO ABANDONMENT of GLB/Three.js; remain at **B1** until **high-photorealistic visual quality and fully working real-GLB renderer** earn real OWNER PASS. First B1 signed [CI #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) was SOURCE PASS only; phone showed **FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1**, intermittent **black canvas switching Eco/Balanced/High**, FPS continuing on blank image, overlapped Android upper bars/lower Classic metrics and camera wall/clipping problems. **B1 = REWORK/BLOCKED FOR ADVANCE; no B2/B3/B4.** User's future order: repair B1 photorealistic High → B2/B3 prerequisites → **COMPLETE new 3-door Agro ground-floor lobby plus ALL three working rooms (Warehouse, big Garden, small PhytoLab)** → RETROFIT old first-floor five-door Lab Lobby and labs → complete Trialum 3D transformation. Documented at [ADR-005](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [B1 R1–R5 repair/evidence](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [full 3D roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md) · [ACTIVE B1 continue here](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_OWNER_REWORK_CONTINUE_HERE_20261115.md). Earlier green labels and instruction "B1 next GO/NO-GO" are HISTORICAL. **Documentation task ONLY, no B1 fix code or new APK yet.** Preserve original engine, saved worlds, five old working labs and trusted SignQA. Read new ADR before any code change.

> **MANDATORY B0–B9 GLB-FIRST OWNER ARCHITECTURE — 2026-11-15.** [canonical B0–B9](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [asset/scene/GLB contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [non-bypassable owner/phase gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer trial](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). Original L3.9 **plant engine has explicit OWNER FULL PASS on 2026-11-15** after installing signed QA build; [GitHub #171](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653) source SHA 7466c38c0f863cf4299fbdf6263f823c60b2608d. This does **NOT** approve future GLB/3D construction. **B0 is NEXT**, B1 Three.js GLB isolated pilot, B2 assets, B3 world/bridge, then B4 Agro Lobby/B5 Warehouse/B6 Garden/B7 live interactions/B8 PhytoLab/B9 polish. No bypass without an explicit, versioned owner-approved exception. Three.js is the pilot candidate, not already a full replacement; preserve NovaGL2, five first-floor labs, core/save/food, and owner-only GitHub SignQA. **Main-branch master documents are binding on this still-Draft development branch.**

# TRIALUM LW-D — CANONICAL OPERATING RULES, FCM, SIGNING & PHASE GATES

**Owner-directed, 2026-11-14. Applies to ALL subsequent LW-D phases.**
**Status:** GitHub build + automatic owner-key QA signature **PASS**; real phone FCM notification **OWNER PASS on 2026-11-14** (owner: "Работи ФЦМ сега."). Independent LW-C contextual social/AI, backup and wider L3.1 review remain separately gated and must not be assumed PASS.

This document is the **single durable LW-D rulebook**. Read it BEFORE proposing Firebase setup, creating Android build variants, touching signing, cutting a new phase branch, merging code or promising a test APK. Keep it referenced from the master 3D roadmap and L3 laboratory plan. Do not rely on a chat summary instead.

## 1. Three existing identities; strictly separate development ownership

| Owner lane | Android application ID | Existing Firebase App ID variable | Signing identity |
|---|---|---|---|
| Codex — official Release / beta / Play Console | `com.trialum.ziivaiskra` | `TRIALUM_FIREBASE_APP_ID` | existing Release signing system |
| Codex — Friends Debug | `com.trialum.ziivaiskra.signdebug` | `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG` | existing permanent `trialum-qa` signer |
| LW-D — owner test / Signing QA | `com.trialum.ziivaiskra.signqa` | `TRIALUM_FIREBASE_APP_ID_SIGNQA` | existing permanent `trialum-qa` signer |

**Never invent a fourth Firebase Android app**, including `.lwd1`, while LW-D's assigned registered identity is `.signqa`. The legacy `.lwd1` 3D preview is historical and does not define the current FCM acceptance APK. Do not silently replace one package's Firebase App ID with another's. No new application ID or certificate without an explicit owner decision and migration plan.

**Never touch, publish, rebuild as the LW-D output, or alter the Codex Release/Friends Debug lanes.** LW-D source is isolated in draft branches until owner test and acceptance. Preserve the full gameplay engine and data, Play Games opt-in behavior, backups, pet identities, social services, and the working LW-C AI dialogue logic.

## 2. GitHub settings ALREADY EXIST: inspect first, reuse, do not ask owner again

Repository: `extreme4music-nexus/Trialum`.

Existing Actions Variables referenced by the working workflows:
- `TRIALUM_SOCIAL_API_URL` (existing HTTPS Friends endpoint)
- `TRIALUM_FIREBASE_APP_ID`
- `TRIALUM_FIREBASE_APP_ID_SIGNQA`
- `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG`
- `TRIALUM_FIREBASE_SENDER_ID`
- `TRIALUM_FIREBASE_PROJECT_ID`
- `TRIALUM_FIREBASE_API_KEY`
- `TRIALUM_QA_CERT_SHA256` (public signing certificate fingerprint)

Existing Actions Secrets used for **automatic QA signing**:
- `TRIALUM_QA_KEYSTORE_B64`
- `TRIALUM_QA_STORE_PASS`
- `TRIALUM_QA_KEY_PASS`

All signing credentials are confidential: do not display, copy into Git, echo in logs, request reposting, or store in docs. Treat the presence of a `vars.*` or `secrets.*` expression in source as proof that the workflow **references** the setting, not proof that the value is filled; use a real workflow run to confirm. The owner has independently shown repository Variables and has confirmed Secrets are already configured. A genuine missing variable is not permission to invent a new setting.

Before any FCM work, inspect:
1. `.github/workflows/android-signing.yml` — EXISTING canonical GitHub keystore / QA certificate / SHA-256 validation. Do not rewrite or copy secrets from it.
2. `.github/workflows/lw-d-android-qa.yml` — LW-D-only build and trusted automatic `SignQA` signing.
3. `android-template/app/build.gradle.kts` — `signqa` type and package-scoped `trialumFirebaseAppIdSignqa`.
4. `android-template/app/src/main/java/com/trialum/ziivaiskra/TrialumPush.kt`, `TrialumFirebaseService.kt` and `TrialumApplication.kt` — consent and notifications.
5. `server/src/push.mjs` and Messages `pushAvailable` — distinguish actual server-side FCM readiness from client APK config.
6. Prior completed repairs PR #36 and #38; `docs/LW_FCM_ROOT_CAUSE_FIX_20261112.md`; `docs/LW_D_FCM_RESTORE_QA_PENDING_20261114.md`.

## 3. Canonical build-and-sign process — ALL AUTOMATED ON GITHUB

**Source branch:** LW-D-only draft PR, independent of Codex's beta/Play Console work.

**Build:** `:app:assembleSignqa` uses the existing Firebase `TRIALUM_FIREBASE_APP_ID_SIGNQA` and existing Friends HTTPS endpoint. CI **inspects compiled APK resources**, package name and bundled world/AI files. A green Node test alone is not a green Android build.

**Sign:** For the explicitly approved, trusted LW-D push branch, a separate GitHub job:
- checks `github.event_name == 'push'`, owner actor `extreme4music-nexus`, and the **specific authorized branch**;
- consumes the *existing* QA keystore/password Secrets with alias `trialum-qa`;
- signs via Android build-tools `apksigner`;
- validates v2/v3 signatures, package, version, non-debug flag and `TRIALUM_QA_CERT_SHA256`;
- removes ephemeral keystore files from the runner and uploads ONLY a signed internal QA artifact (plus SHA256/provenance), with no Google Play submission.

**NEVER tell owner to sign locally. NEVER generate a new key or ask for another Firebase registration.** Untrusted PR checks never receive secrets or publish signed APKs.

**Forward compatibility:** the current trusted branch allowlist/signing guard is deliberately strict. At the start of **each new LW-D phase branch**, explicitly extend/review the trusted trigger to that branch before requiring a signed device APK. Do not broaden signing to all branches or PRs just to avoid a config check. Document the new branch and source SHA. All future LW-D test APKs must be built and automatically signed using the already-proven QA identity and certificate; do not regress to disposable debug signing.

## 4. Exact proven evidence; separate build PASS from actual FCM PASS

- [GitHub Actions run #43589653767](https://github.com/extreme4music-nexus/Trialum/actions/runs/43589653767): **PASS** for LW-D regressions, Android `SignQA` compilation, embedded Firebase/HTTPS config, **automatic GitHub owner-QA signing**, certificate SHA-256 and artifact upload.
- Signed artifact: `Trialum-LW-D-L3-1-OWNER-SIGNED-SIGNQA-60`; inside: `Trialum-LW-D-L3.1-SIGNQA-SIGNED.apk`. Historical artifact expires on 2026-11-28. Always select the **newest successful trusted push artifact from the exact source SHA** for future QA; do not present an older artifact as a new phase build.
- **FCM real-device acceptance achieved 2026-11-14:** owner explicitly confirmed `Работи ФЦМ сега.` — mark FCM feature **OWNER PASS**. The owner did not specify every foreground/background, mute/block or notification-channel scenario; do not manufacture extra test evidence. Local notification self-test alone is distinct from remote push. Future builds must preserve the functioning FCM path.
- **FCM OWNER PASS is now directly reported by the owner, not inferred from CI.** It closes the FCM recovery issue. Do not infer a general approval for L3.1, LW-C dialogues, Friends, backup/restore, Google Play or a public release; their QA gates remain separate.

## 5. Mandatory no-regression checklist before any phase

- Preserve full **LW-C** autonomous AI contextual dialogue, group turn-taking, 36-turn room memory and opt-in. `feature/lw-d-forward-consolidation-lwc-20261114` was created because L3.1 descended from main and missed the newest LW-C capabilities. Do not silently revert these features again.
- Preserve original state, pet IDs, friendships, shared playground, messages and user-controlled backups. Keep all existing classic modules reachable from World Atlas until their real 3D replacement passes owner acceptance.
- Preserve native `SignQA` package identity and stable signer, Firebase binding and HTTPS social endpoint. Never wipe/uninstall applications or data as a workaround for a signature mismatch.
- Enforce all automated tests, Android build, APK packaged asset checks, signature/provenance, then physical-device owner acceptance. Mark each gate separately; do not conflate code presence with an observed working feature.
- No automatic Play publishing or server/DB/router modifications. No background GPU/LLM execution in a non-visible scene. Maintain bilingual UX and offline/Ai-off functionality.
- One phase at a time: no L3.3 until L3.2 owner-reviewed; no biospheres until the whole laboratory complex and L3.6 end-to-end gate are accepted.

## 6. Precisely what comes next in LW-D

**Completed operational gate:** Existing SignQA APK compiled and automatically signed on GitHub, then the owner reported working FCM on the physical phone (2026-11-14). **Do not repeat Firebase or signing setup.** Continue separate non-FCM regression checks for Friends, opt-in AI two-pet conversations, turn-taking, backups and existing L3.1 corridor/instrument functionality; record results independently. These checks may accompany the next development QA but must not be silently deemed passed.

**Next coding phase: `LW-D L3.2 — 3D DNA laboratory`** (after confirming the recovery branch is retained as the source baseline, without affecting Codex's Release/Debug). Build a physically distinct, interactive DNA lab entered from the existing five-door laboratory corridor:
1. Proper 3D room, benches/equipment, camera/touch navigation, contextual holographic controls.
2. Integrate the **existing** DNA feature unlock gates, research/cost/progression controller, persistent game data and locked-state explanations. Do not invent a parallel DNA economy or mint pets/mutations.
3. Visualize authorized DNA operations and failure feedback at the corresponding machine. Never claim rendered simulations are genuine biology; distinguish educational facts and the game's fictional creatures.
4. Keep old DNA classic route as a reliable fallback. Test Android landscape/fullscreen/back/zoom, AI OFF/offline, MK/EN labels, resource invariance, backing-store save/restore and owner review.
5. Release a new **automatically GitHub-signed SignQA-only** internal QA build from an explicitly approved LW-D branch. Never automatically touch Codex's official release or Friends Debug.

Then: **L3.3 food-production laboratory → L3.4 flora-production laboratory → L3.5 research wing → L3.6 complete laboratory QA and owner sign-off**. Only then shift primary development to 3D biospheres, followed by pets+homes, per the master 3D owner roadmap.

## 7. Why these rules exist

On 14 Nov 2026 the earlier LW-D work accidentally omitted the configured Firebase binding, then mistakenly invented a fourth App ID and a local-signing requirement. Both were contradicted by existing repository Variables, Secrets and GitHub signing jobs. The user had to correct these assumptions repeatedly. **Prevention is mandatory source inspection, the same three-app ownership mapping, reuse of existing working pipelines, and precise evidence-based CI/device status.** Do not make the user repeat settled setup. This note supersedes stale descriptions of local signing and a fourth `.lwd1` Firebase app in older LW-D documentation; keep older documents for historical context only.
