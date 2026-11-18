# TRIALUM S7 — F03 GREY-GREEN STONE (2 finishes) · DURABLE HANDOFF
**18.11.2026 · DESIGN / RENDER GATE — NO F03 GLB BUILT, NO GAME INTEGRATION.**

## 0. OWNER AUTHORITY — read first
This document is the canonical F03 handoff if the ChatGPT/Codex session ends. The owner explicitly requests **two complete form libraries of the SAME grey-green natural stone** and **all required 3D renders FIRST**, before committing any real `.glb` models. No generated preview is owner-approved merely by appearing here. Wait for explicit visual owner PASS for the composite shape renders, and correct anything rejected. Owner PASS has priority on aesthetics; tests certify technical file correctness, not that the result is visually faithful.

**Current owner-approved visual references, original chat image assets:**
- `REF-F03-SMOOTH` = `sage_gray_stone_tile.png` — original 1448×1086 render, SHA256 `b50a1542ed4ef986424a025bf4237955b1b5d78ead42084ca8a0c3c06209fa17`. Very low sheen, natural sage grey-green sedimentary stone, subdued warm greige quartz streaks, refined honed/smooth upper surface, subtle rounded/chamfered edges, ~6 cm slab.
- `REF-F03-SUBTLE` = `refined_textured_sage_gray_stone_tile.png` — original 1448×1086 render, SHA256 `7d069b68df567197ba7f9e950982a4a39a811ee822f264a77d0e7a73e3eaa1b6`. **Exactly the SAME underlying stone hue, subtle streaks and beveled shape** with only a little tactile unevenness and delicate shallow fine stone grain. Do NOT convert it into coarse rock, cobblestone, pebbles, gravel, rugged split-face, harsh pits, heavy grooves or shiny marble.
Both PNG files are supplied in the chat; the downloadable handoff bundle includes both exact PNGs. They are not currently claimed as Git blobs.

## 1. PROJECT / STAGING FACTS — verified
- Canonical game repo: `extreme4music-nexus/Trialum`; existing F02 owner-review base `feature/lw-d-s7-f02-black-marble-render-kit-20261118` (PR #99). New isolated F03 render-only branch: `feature/lw-d-s7-f03-gray-green-stone-render-review-20261118`.
- Designer repo: `extreme4music-nexus/Trialum-3D-Builder`, `main`, original `assets/catalog.json`, source generator directory `tools/b1/`, editable `projects/`, real GLB folder `assets/models/`, Windows launcher `START-BUILDER-WINDOWS.bat`.
- Verified latest Builder total **76 physical GLBs** = 47 previous F01/room GLBs + 29 black F02. **ZERO F03 GLBs** at start of this request.
- Game canonical render brief: `docs/S7_GREENHOUSE_EXECUTION_ROADMAP_20261117.md`, `docs/S7_GREENHOUSE_VISUAL_BIBLE_20261117.md`, `docs/S7_GREENHOUSE_MASTER_REQUIREMENTS_20261117.md`, ledger `docs/S7_GREENHOUSE_BUILD_LEDGER_20261117.json`. S7 floor calls out F01 cream white, F02 black, **F03 grey-green natural stone**; repeatable metric tile grid, proper beveled edges/corners, dry/wet appearance.
- F01 original shape generators + source metric dimensions exist under `tools/b1/build-s7-f01-*.py`. F02 source generator: `tools/b1/build-s7-f02-black-marble.py`, F02 catalogue comprises **29 physical variants** including the auxiliary enlarged L corners/raised borders. Preserve F01/F02 assets unchanged.
- Owner has visually passed black F02 and earlier F01-G; this is **NOT** approval of F03 special shapes/finished GLBs.

## 2. TWO DIFFERENT FINISHES, ONE SHARED STONE DNA
- **F03-S · SMOOTH**: color = muted grey-green sage, neutral grey mineral body, whisper warm greige/cream wisps with soft swirled stone sediment, no black/white marble lightning veins. Smooth honed surface, very modest micro normal, low/medium natural satin sheen, top face geometrically flat except tiny bevel.
- **F03-T · SUBTLY TEXTURED**: **identical basecolor reference** and per-piece mineral pattern continuity; finer organic mineral micropores, finely wavy almost imperceptible bumps, daylight-catching low-relief grain; no gritty crumbs, sharp pits, lumps or major bumps. Goal is perceptibly different at grazing angle and close-up while still premium, gentle and clean. Dry/wet design finish only; **NEVER claim real-world anti-slip certificate**.
- PBR suggested for review, **not final**: S metallic=0, roughness ~0.55–0.65; T metallic=0, roughness ~0.72–0.82 and tasteful fine normal map and gentle sub-mm real geometry for top where useful. Maintain identical underlying base color from source references; do not oversaturate green or turn warm beige.
- GLB generation later should be deterministic, include real texture/normal inside glTF2, preserve spatial UV phase for B/C and adjacent tiles, and output physically selectable 3D meshes. Rendering images alone do NOT count as GLBs.

## 3. COMPLETE FORM MATRIX — render BOTH finishes independently before any GLB (54 prospective GLBs total)
**Reference shape conventions**: same F01/F02 authoring system. Each row requires corresponding physical tiles for both S and T; when owner asks for all forms, do not make only smooth whole tile plus rough standalone variant.

| Family | Shape | Exact physical assets per finish | Geometry baseline / review |
|---|---|---:|---|
| A | full square | 1 | 1.0×1.0 m × 0.06 m, 4 mm fine bevel |
| B | half pieces | 2 | 1.0×0.5 m, two complementary UV phases |
| C | quarter pieces | 4 | four 0.5×0.5 m quarters with continuous veins |
| D | straight border/edges | 4 | N/S/E/W real separate edge trims |
| E | small corner caps | 4 | NW/NE/SE/SW precise corner junction pieces |
| F | pool-side radial tile | 1 | **small actual G01** curved segment, not earlier rejected oversize outer wedge |
| G | curved pool edge trims | 3 | one ~1m modular, one half, one long ~3.26m showroom version |
| L | large L-shaped presentation corners | 4 | NW/NE/SE/SW, matched to F02 showroom corner forms |
| R | raised straight border showcase trims | 4 | N/S/E/W, matched to F02 large 3D border presentation forms |

**Total = 1+2+4+4+4+1+3+4+4 = 27 per finish, 54 possible actual GLBs for S/T after PASS.** This is a PROPOSED review count derived from actual F02 27 non-finish geometries, not an authorization to build all at once. Final 3D design owner decisions could simplify the showroom extras; preserve shape fidelity over forced item count.
- Same 1×1 grid and pivot conventions as proven F01/F02.
- For water: **real G01 source** `tools/b1/build-agro-g01-watercore.py`. Pool side individual F01-F and F02 equivalents use actual r7.2–8.2 band next to rail, NOT an oversized wedge outside r9.15; raised curved edge approx r8.2–8.39. Full-circle installation requires separately reviewed bridge/satellite clearance. Showcase 3m G trim is display-only; it is NOT a substitute for three independently selectable G segments.
- All names shall differentiate `f03-s-*-` and `f03-t-*-` (or equivalent predictable scheme); **no overwriting or repurposing F01/F02 IDs**.

## 4. IMAGE RENDER CHECKLIST — DO NOW
Present **four large, high-quality design review boards, clearly separated into two finishes**:
1. **SMOOTH S — modular foundation set**: full tile A; two complementary halves B; four quadrants C; four straight edges D; four small corner caps E. 15 objects. Realistic physically separated objects with nice perspective, true stone fidelity.
2. **TEXTURED T — identical modular foundation set**: the same 15 object forms, dimensions, camera and lighting; only subtly rougher top stone.
3. **SMOOTH S — speciality set**: F single curved G01 pool-side tile; G three raised arc trims (long 3m showcase AND 1m modular AND half); L four large L-corners; R four raised straight showroom border trims. Total 12 objects. Optionally show a partial G01 pool assembly, NEVER misrepresent huge one-piece outer wedge as multiple small tiles.
4. **TEXTURED T — identical speciality set**: same 12 shapes and design, but surface has understated tactile grain.
Label groups simply A/B/C/D/E and F/G/L/R; avoid lots of tiny unreadable labels. Show all objects unclipped, not fused, with meaningful separation and one repeated G01 tile arc inset. Render same sage stone through the whole family, no alternate palette.
**Owner receives 4 images (2 finishes × 2 groups) to review. If user asks for single-file posters, make one per finish containing both groups, but default is 4 readable sheets.**

## 5. POST-RENDER NEXT STEPS — ONLY AFTER EXPLICIT OWNER PASS
1. Review both finish families, textures and all part shapes. Record corrections by family, not a rushed blanket acceptance.
2. Extract original 1448×1086 S/T image textures into clean, tileable source atlases with perspective correction; preserve distinct appearances and original source-image SHA. Keep source texture and normal maps saved permanently in both repositories, unlike merely referring to chat image.
3. Implement deterministic F03 generator in isolated game branch and mirror in Builder: exact 1 m dimensions, independent local origins/pivots, normals, UV continuity, 4 mm bevel, physically solid GLB mesh, appropriate textured variant. Every part genuinely geometry-correct.
4. Generate 54 models (or final owner-adjusted complete list), manifest SHA256 + dimensions/pivots/materials and provenance; **physical binaries in BOTH repositories**; avoid CI-only ZIP or fictitious catalogue records. Update Builder `assets/catalog.json`, editable gallery per finish, two-in-one comparison, true G01 preview, Windows startup checks, 3D camera.
5. Automated checks: glTF2 header/chunks, nonzero meshes, no degenerate triangles, closure/orientation, exact file count, texture atlas SHA source, geometry bounds, component spacing, S/T material separation, source-compatible scene layout, game repository and Builder binary hash match, localhost serving, GitHub Actions CI PASS. Owner must visually inspect actual GLBs inside Builder.
6. **Do not touch Trialum main, Classic, beta/Android/Play, live 3D water or gameplay/inventory.** Keep a draft review PR. The F03 asset library is not automatically a game release.

## 6. HANDOFF RESUME / NEXT CHAT PROMPT
"Продолжи со `docs/S7_F03_GRAY_GREEN_STONE_RENDER_HANDOFF_20261118.md` во Trialum-3D-Builder/main и Trialum feature/lw-d-s7-f03-gray-green-stone-render-review-20261118. Одобрени се само двете основни 1m F03 референтни слики REF-F03-SMOOTH и REF-F03-SUBTLE. Направи/провери 4 табели со сите форми во истиот камен. Не генерирај GLB пред мој експлицитен PASS на новите рендери. Не мешај со F01/F02; не прави голема F-плочка надвор од базенот."

**Render preview acceptance remains PENDING. All 54 F03 model count is PLANNED, not BUILT.**


## 7. FOUR 3D SHAPE REVIEW BOARDS — GENERATED IN CURRENT SESSION, OWNER REVIEW PENDING
These are **real mesh-based 3D preview renders**, not approved physical GLB models. Each visual uses a stone atlas perspective-corrected from the corresponding approved single-tile reference image. Reference colors/veins are preserved; artistic 3D board lighting is not proof of pixel-perfect equivalence.
- `F03_S_FOUNDATION_3D_RENDER_REVIEW.png` — 15 smooth base parts A/B/C/D/E; SHA256 `28c14e572a64be07` (prefix)
- `F03_T_FOUNDATION_3D_RENDER_REVIEW.png` — same 15 parts in subtle textured stone; SHA256 `0cc8cddb91fec2ab` (prefix)
- `F03_S_SPECIALITY_3D_RENDER_REVIEW.png` — 12 smooth specialty parts F/G/L/R; SHA256 `a8d7b320d2997163` (prefix)
- `F03_T_SPECIALITY_3D_RENDER_REVIEW.png` — same 12 textured specialty parts; SHA256 `e270e8d55f5de908` (prefix)

All exact PNGs, two original approved reference PNGs, regeneration source `f03_render_boards.py`, and full SHA256 `F03_RENDER_REFERENCE_SHA_MANIFEST.json` are **packaged for owner download in conversation** as `Trialum_F03_Stone_Render_Handoff_20261118.zip`. The PNGs are **NOT yet committed to GitHub**; the durable text handoff is. If image files are not available after a limit reset, ask the owner to upload the ZIP rather than inventing stone texture or claiming a render review PASS.

This completes the **render production** gate, NOT the **owner visual approval** gate: `RENDERED_OWNER_PASS_PENDING`. GLB asset count for F03 is **zero**; do not start F03 GLB work without explicit owner approval of these shape boards. 
