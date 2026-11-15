# TRIALUM B1-R1 — REAL GLTFLoader semantic anchor fix, signed QA and phone acceptance
**2026-11-15. Status: R1 CODE IMPLEMENTED + REAL-LOADER CI PASS + SIGNED APK; OWNER DEVICE CHECK PENDING.** B1 as a whole remains **OWNER DIRECTED REWORK/BLOCKED** until all R1–R5 pass. Do not start B2, Agro 3D geometry, retro-labs or city.

**Authority:** [ADR-005](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [B1 incident and R1–R5 microphases](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [B1 Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76).

## 1. Defect verified by owner
First SignQA #176 was successfully built/signed, but the owner's real Galaxy A55 video showed:
FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1.
The original implementation called gltf.scene.getObjectByName(id) on GLTFLoader Object3D names. glTF node names are not a stable semantic ID contract and may be sanitized. An independently rendered procedural fallback kept a gray box room visible, so CI binary/header tests had not verified true GLB rendering.

## 2. Exact code changes within B1 (R1 ONLY)
- **prototypes/lw-d/b1/anchor-resolver.mjs (NEW):** independent, DOM-free function resolveGLTFAnchors(scene,manifest) which traverses a REAL THREE.Object3D scene and validates **userData.semanticAnchor** loaded from glTF extras, not getObjectByName. Checks exactly 2 known IDs, uniqueness, no unexpected anchors, no independent game authority, finite meter-scale world coordinates (Y UP), <=0.015m position drift and >0 meshes. collectGLTFWallBlockers uses reliable extras.semanticPart for meshes, with old mesh names only as fallback for procedural primitives. Do not infer identities from child indices.
- **tools/b1/generate-glb.mjs:** every room mesh gets extras.semanticPart; two anchor nodes retain semanticAnchor/hasNoGameAuthority, same original positions. The GLB is still generated at build time, bundled in the offline APK, no external runtime network.
- **prototypes/lw-d/b1/pilot-runtime.mjs:** replaces failing getObjectByName with resolveGLTFAnchors on the loaded actual GLTFLoader scene. Markers and hit proxies take authoritative loaded *world* coordinates. Wall blockers resolve using semantic metadata instead of normalized names. Shows correct truthful status **REAL packaged GLB loaded — GLTFLoader verified 2 semantic extras anchors** on success or **FALLBACK geometry active — GLB load/parse / semantic anchor validation: ...** on failure. Independent serial prevents stale async glTF loads from overriding a newer displayed scene. No TrialumEngine writes/AI/social/save added.
- **tests/lw-d-b1-gltf-loader-runtime.test.cjs (NEW):** actual pinned r187 GLTFLoader.parse of the same generated binary GLB in Node CI; tests real 3D object graph, semantic extras anchors, correct world coordinates, actual wall metadata, success even if THREE.Object3D.name is arbitrarily sanitized/renamed, rejection of altered transforms, duplicates, unexpected semantic IDs, authority and missing nodes, no game mutation.
- **tests/lw-d-b1-glb-pilot.test.cjs:** structural source test now checks resolver instead of hardcoded getObjectByName and still protects original engine/old five labs.
- **.github/workflows/lw-d-android-qa.yml:** new real GLTFLoader test runs after local Three install/GLB generation and BEFORE Android build/SignQA signing. Original owner-only permanent GitHub signer and package preserved.

## 3. Evidence: real glTF decode + Android build/sign PASS
- **[GitHub Actions B1 run #181 — both jobs SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43721113985)**; exact compiled source commit **d6708bb8a74626aafe5af1da7f3533c668b12ea3**.
- Runtime actual Three GLTFLoader tests: **4/4 PASS**, in addition to original 7/7 binary/static tests and existing original-game regression/Android asset packaging/Signer checks.
- Generated real offline GLB: **5796 bytes**, SHA256 **774a84cb4b9384ca66b2e97284b195594537774fb55d26c7fc064f0f4410c5bd**. It contains B1 floor, doorway, wall, table, two semantic anchors with extras.
- Locally bundled Three renderer: **654001 bytes**, SHA256 **62540c55e437ad44e758f32c9749998dc62cc027a7c5673b5086ce78387c7026**.
- **ONLY INSTALL THIS SIGNED ARTIFACT**: [Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-181](https://github.com/extreme4music-nexus/Trialum/actions/runs/43721113985/artifacts/14164607495), GitHub artifact ID **14164607495**, ZIP SHA256 **b0e4b807e6e4971d51959f920533d4ed258ce0d3b42b2ee80d6315122870783a**, expires 2026-11-29. Inside ZIP: a signed SignQA APK, **not** the UNSIGNED #181 artifact ID 14164152980.
- Existing tested package **com.trialum.ziivaiskra.signqa**, same existing permanent owner QA certificate; install as an **in-place UPDATE**, do not uninstall or clear original world. VersionCode still 34. If Android refuses install, record the error; no forced wipe.
- Before signed run #181, new source was not on phone. After #181, R1 is verified in official GLTFLoader Node runtime and compiled APK **but no new user phone feedback exists yet**. No invented real-device GLB PASS.

## 4. Phone verification protocol R1 (not R2/R3/R4 yet)
1. Open [GitHub signed artifact #181](https://github.com/extreme4music-nexus/Trialum/actions/runs/43721113985/artifacts/14164607495) while logged in, download ZIP, extract **SIGNED** APK and update existing Trialum Signing QA. Do not delete data.
2. Open original app, verify existing pets/plant inventory, then tap **B1 GLB Pilot**.
3. The crucial evidence is the exact on-screen message:
   **REAL packaged GLB loaded — GLTFLoader verified 2 semantic extras anchors**.
   If it says **FALLBACK geometry active**, capture the FULL error text; B1-R1 is STILL BLOCKED on device, regardless of green CI.
4. Check that the real room floor/door/table are visible and tap table and door mint markers. Verify selected anchor exact IDs and no through-wall click; intentionally click **Test missing GLB fallback**, then **Reload real GLB**, and verify return to REAL GLB status.
5. Return to original Classic/old five lab rooms, no lost save/pets/plants/food, and report whether the real GLB is genuinely loading. Device heat/High visuals are LATER B1 R2/R4, not assumed here.
6. If quality changes still show a black viewport or HUD/camera remain cramped, that is the **known B1-R2/R3 OPEN issue**; DO NOT call whole B1 OWNER PASS. Only report R1 successful if the actual GLB stays active.

**R1 PHONE STATUS: PENDING OWNER VALIDATION. B1 OVERALL OWNER PASS: NOT GRANTED.**

## 5. Next sequential tasks AFTER R1 device evidence
- **B1-R2:** investigate/fix black canvas on Eco/Balanced/High and context/viewport changes with REAL visible-content measurement; current FPS only measures RAF intervals. Do not claim already fixed by R1.
- **B1-R3:** Android system bars, Classic/metrics HUD overlap, camera collision/near-wall clipping and touch/back QA.
- **B1-R4:** true representative high-photorealistic offline GLB PBR textures/shadows/lighting and sustainable HIGH quality on Galaxy A55.
- **B1-R5:** full device regression, owner confirms B1 PASS, then separate B2 asset pipeline; B3 reusable world bridge; complete all 3 real Agro rooms; retrofit old lab lobby; full game 3D.

**No fixes beyond R1 were attempted in this build. No Agro/world code changed. No PR merge or store release.**
