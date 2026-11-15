> **CRITICAL OWNER DIRECTIVE — 2026-11-15, ADR-005 OVERRIDES OLDER B1/B9 STATUS:** [ADR-005 owner GLB/high-photorealism decision](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [REAL B1 phone defects and R1–R5 rework](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [complete 3D conversion roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md). **Current B1 = OWNER-DIRECTED REWORK / BLOCKED FOR PHASE ADVANCE**, not OWNER PASS and NOT abandonment of Three.js/GLB. Signed [CI #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) was green, but Galaxy A55 recording showed **unexpected fallback (missing GLB anchor pilot.table.action-1), black 3D canvas after Eco/Balanced/High changes, unreliable visual inference from high RAF FPS, Android safe-area overlap and camera wall clipping**. Work **ONLY in B1**, fix all defects then show **genuinely premium photorealistic quality and functionality** with stable mobile High, original engine and five labs unchanged; owner expressly accepts B1 before B2/B3. Then B2/B3 prerequisites → **finish entire 3-room Agro ground-floor lobby/wing (B4–B9)** → **retrofit old first-floor five-door lab lobby and labs** → **complete game-wide 3D conversion**. **This is documentation only; no defect is fixed yet.** Older "B1 CI pass", "B0 next" and "Three.js optional to abandon" notes are HISTORICAL and superseded where inconsistent.

> **OWNER ACCEPTANCE STATUS — 15 NOV 2026 (LATEST):** B0 source-freeze **OWNER PASS** was explicitly granted after owner reviewed B0 docs. B1 has now been IMPLEMENTED in [Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76), based on B0 Draft PR #74, not main. Isolated **real offline Three.js 0.187.0 GLB** 6×6m pilot with two named sockets, raycasting, GLB failure fallback, PBR, Eco/Balanced/High and frame-time metrics; **original L3.9 engine/food/saves and the five first-floor NovaGL2 laboratories unchanged**. [B1 GitHub Actions #176 BOTH JOBS SUCCESS + existing owner SignQA verified](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547), exact compiled SHA `515219caedeb33f96d60f7619851dbda93d38a89`; artifact `Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-176` ID 14157481756, expires 2026-11-29. [B1 exact implementation and owner's Galaxy A55 test checklist](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_GLB_THREEJS_PILOT_IMPLEMENTATION_20261115.md). **B1 IS CI/SIGNED PASS ONLY, PHONE OWNER PASS PENDING; B2/B3/B4 FORBIDDEN UNTIL EXPLICIT B1 OWNER GO.** No physical Agro Lobby/warehouse/garden/PhytoLab yet. The earlier "B0 next" status in this same document is historical; this heading supersedes it. Unrelated [English text sync issue #75](https://github.com/extreme4music-nexus/Trialum/issues/75) remains open and must not be mistaken for B1 rendered-device PASS. Do not merge Draft PRs or publish.

# TRIALUM — MANDATORY 3D PHASE GATES, OWNER AUTHORITY & PR ACCEPTANCE v1
**Owner directive: 2026-11-15. Binding for any future 3D architecture and rooms; the document alone does not technically prevent Git merges.** Read [B0–B9 master plan](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md), [GLB/scene contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) and [ADR-004](ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md) BEFORE planning, changing 3D world code, assets, or signing an APK.

## 1. Source of authority and current starting point
- OWNER explicitly confirmed **L3.9-A plant ENGINE / original gameplay full OWNER PASS** after installing the latest signed QA APK. Log that as passed; do not keep asking for identical confirmation or retroactively claim only automated PASS. This is NOT OWNER PASS for any future B-phase.
- Existing [Actions #171](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653): both jobs CI PASS, source SHA **7466c38c0f863cf4299fbdf6263f823c60b2608d**, Signed artifact **Trialum-LW-D-L3-9-OWNER-SIGNED-SIGNQA-171**. Draft PR #73 is on top of L3.8 Draft PR #72. No new main merge or store release follows from this owner test.
- Current 3D NovaGL2/custom WebGL2 is accepted existing functional baseline; old five first-floor labs remain usable until a tested new renderer reaches parity.
- B0 (baseline freeze) is the **next allowed active implementation phase**. After B0 accepted, B1 isolated new renderer pilot; no new Agro Lobby geometry before successful B1–B3. Do not conflate old project D0–D8 product roadmap with new **B0–B9 3D pipeline**.
- The owner alone can change the sequence or authorize a waiver. A chat assistant, CI, another agent or generic industry advice cannot grant that approval.

## 2. Phase-state machine — no silent completion
Each phase must have EXACT ONE status:
1. PLANNED — documented only, no code or QA.
2. IMPLEMENTING — isolated branch and source modifications, not shipped.
3. CI_PASS — full targeted regression, build, commit SHA verified; no phone verdict.
4. DEVICE_TESTING — owner install/observe on his physical Galaxy A55, issues tracked.
5. OWNER_PASS — owner explicitly accepts named phase/criteria; lock that phase's functionality and carry its regressions forward.
6. BLOCKED — tests, data safety, performance or owner-reported behavior fail; subsequent implementation stops until resolved.
7. SUPERSEDED_BY_OWNER_DECISION — ONLY if owner explicitly changes order, recorded in a new versioned decision file.

**Prohibited:** READY / DONE / COMPLETE / PASSED when only graybox renders or CI ran; "owner approved" from inferred praise; fake screenshot/benchmark/battery results; continuing to B+1 on undocumented partial pass.

## 3. Mandatory preflight checklist for ANY new 3D issue/PR
- [ ] Read exact current README + docs/LW_D_CONTINUE_HERE.md, this gate, master B0–B9, technical asset/scene contract and current owner operating/signing rules.
- [ ] Confirm current source branch/ref/base/PR, dependency on existing L3.9 source and exact owner-passed baseline SHA (#171). No guessing that L3.9 code is already in main.
- [ ] Identify and explicitly state one B-stage and its narrow acceptance outcomes. Separate real 3D model from future not-yet-built previews.
- [ ] Identify unchanged gameplay/food/plant/AI/social/save features; no parallel simulation/stock.
- [ ] Identify which model IDs/anchors/GLBs and fallback variants are added, plus attribution/license, metric scale and interaction proxy tests.
- [ ] Identify what must be implemented in core vs world architecture vs renderer. A new 3D room is NOT allowed to invent or modify core engine business logic as part of graphics only.
- [ ] Declare runtime device goals, exact measurement method and fallback if B1 Three.js pilot is rejected.
- [ ] Declare tests and migration risks: legacy backup, unlocked species, planted IDs, garden/home/flora, food stock, same phone SignQA signer.
- [ ] Confirm B previous owner PASS and that no other active phase is being concurrently merged or silently skipped.
- [ ] No new Release/Play upload, Firebase app ID, sign certificate, server/DB migration or background AI without separate explicit user decision.

## 4. Mandatory exit checklist (per B-stage)
- [ ] Source files committed and PR diff reviewed; exact branch/ref/base/SHA listed.
- [ ] Automated unit+integration and regression suite PASS, including existing 3D labs, original food, L3.9 plant cycle and saves, no duplicate plant/resource writes.
- [ ] GLB/asset validation PASS for new scene models including anchors, metric scale, collider proxies, missing asset fallback and offline packaging.
- [ ] Original engine authority enforced; no unsupported operations accepted; one valid action→one engine receipt→one visual reaction.
- [ ] Android build via trusted GitHub Actions; ONLY existing permanent SignQA package/signer and no new secrets/identity; artifact name and workflow run listed.
- [ ] Owner real-device test covers touch, landscape, Android back, offline, hide/resume, load/re-entry, visual clipping, legibility, battery/performance and old game continuity.
- [ ] Known limitations accurately documented; where there is an unbuilt feature, button is disabled/marked future, not pretend working.
- [ ] OWNER explicitly says PASS or raises issues, and the exact acceptance is recorded with date, scope, source and platform. NO generic extrapolation to other rooms or future store release.
- [ ] Relevant docs and master status updated ONCE with evidence; next B-stage moves to PLANNED/IMPLEMENTING only after this gate.

## 4A. Mandatory ADR-005 owner override — real B1 VIDEO FAIL / do not bypass
**Actual owner decision 15 Nov 2026:** B1 first signed [#176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) had SOURCE and QA SIGN success but real Galaxy A55 displayed fallback with anchor pilot.table.action-1, black viewport under quality switching, overlay and camera defects; B1 must be set to **BLOCKED / OWNER REWORK**, not OWNER PASS. The chosen GLB-first path remains mandatory; B1 must reach HIGH PHOTOREALISTIC quality with complete functionality **before** progression. Follow [R1–R5](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md). A small graybox merely loading/working and high RAF FPS are **NOT** acceptance. Original L3.9 plant and B0 owner PASS are unchanged. After B1 pass, B2/B3 remain technical prerequisites, then **whole real Agro lobby + all 3 full rooms**, then **retrofit old lab lobby**, then **full-world 3D**. Only the OWNER grants pass/exceptions; no agent may trade this for speed or roll back to permanent box-only scenes.

## 5. Required B-stage micro-gates
| Stage | Required evidence | Stop condition |
| --- | --- | --- |
| **B0** | Owner-approved L3.9-A recorded, tested source/build, complete baseline feature inventory, protected backup/rollback and source/ref/PR, next pilot plan | Missing saved baseline or ambiguous branch |
| **B1 — OWNER REWORK** | ACTUAL GLTFLoader-loaded GLB and stable extras anchors, fallback on intentional error only; ZERO black frames under Eco/Balanced/High, camera/collision, Android safe-area; representative HIGH-PHOTOREALISTIC PBR on A55 High with smooth sustainable performance; preserve source/engine/old 5 labs; real signed APK and explicit OWNER phone PASS | Any unintended fallback, black GPU canvas, camera/HUD overlap, mediocre High visual quality, unreliable FPS-only proof, data regression, incomplete tests or no explicit owner verdict — STAY B1 |
| **B2** | Manifest/GLB exporter/validator; swap placeholder→detailed model without changed game logic; exact sockets/collision contract | Missing/unlicensed asset, broken anchor, runtime missing GLB without fallback |
| **B3** | Declarative scene/portal graph; typed and validated original bridge; single receipt/action, camera/touch/mobile back | 3D writes core state, repeated action or collision mismatch |
| **B4** | TRUE ground-floor Agro Lobby with three physical doors and first-floor five-door lab continuity | Only HUD shortcuts or fake rooms |
| **B5** | Food Warehouse GLB and original stock parity, no new food economy | UI-only fake stock or duplicated food |
| **B6** | Huge greenhouse with 4×5 terrestrial slots and 4 aquatic slots, perspective signs, nursery | Wrong bed/media capacity, unrealistic camera, over-budget GPU |
| **B7** | Real seedling→garden→care→mature transplant engine parity, wilting/death and reload tests | duplicate ID/XP, fake success, bypass from unlocked model |
| **B8** | Real shared-element PhytoLab recipes and additive application/stock, repeated-tap rollback | phantom materials, bad deductions, no real plant health action |
| **B9** | Opt-in weather visuals, correct offline fallback/privacy, PBR+three quality modes and multi-room/performance/legacy regression | fake GPS rain, background render, unreadable HUD or dangerous temperature/memory regression |

## 6. Precise owner/device evidence template
Every accepted phase evidence entry MUST include:
- Stage and scope:
- Date/time (Europe/Skopje) and owner approval wording:
- Source branch/base/head SHA and PR URL:
- CI workflow/run number & both job results:
- Signed exact APK filename, package ID, signature verification and artifact URL:
- Android device/OS and real test conditions (Galaxy A55 unless owner chooses another):
- Evidence: real actions performed, screenshots/captures if owner shared, qualitative FPS/heat observations vs measured metrics explicitly distinguished:
- What was NOT tested / deferred:
- Known failures and rollback:
- Explicit owner status: PASS / ISSUES / REJECTED; never invent.
- Next phase eligible? YES only if previous owner gate is PASS.

## 7. Change management and anti-bypass waivers
The four current owner-directed constraints are:
**(A)** GLB-ready from the FIRST NEW 3D-room architecture, **(B)** reusable named anchors/sockets and proxy picking independent of mesh detail, **(C)** PBR/lightmap support with selective mobile effects, **(D)** 1 world unit = 1 meter, consistent floor/room/camera/collider dimensions.

A request to replace any with "draw everything in world.js now and convert later", bypass anchors, turn on bloom indiscriminately, fake a scene or skip owner verification is a **BLOCKER**. Only the owner may allow a specific exception. Record as a versioned ADR/amendment containing: change request, reason, scope/phase, exact impacted source/assets, risk to game/phone, fallback/rollback, compensating tests and owner quote/date. No agent can unilaterally delete this rule or quietly edit it away.

**Important limitation:** GitHub Markdown is not branch protection. The PR checklist makes bypass visible; real mechanical enforcement (asset validator CI, automated gate checks, rulesets if owner permits) is the planned B0/B2 implementation. Do not misrepresent documentation-only changes as automated branch enforcement.

## 8. Non-negotiable release/signing separation
- The protected original Canonical Trialum save, private user data, pet memories, food, plant history and AI opt-in remain unchanged by graphics.
- Owner QA SignQA app is **com.trialum.ziivaiskra.signqa**, same existing permanent QA certificate, GitHub signing only. No local signing, no fourth Firebase app or new forced reinstall. Do not uninstall or clear data.
- Draft PRs are not merged until separate owner consent; no automatic Play beta/public release just because B9 passes.
- Social/Friends Debug/Release remain separate workflows and must not be changed by this 3D visual architecture roadmap.
