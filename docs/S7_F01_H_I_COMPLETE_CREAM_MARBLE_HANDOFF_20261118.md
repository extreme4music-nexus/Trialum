# S7 F01-H + F01-I — last white/cream marble finishes, two genuine GLBs

**Date:** 2026-11-18. **Status:** Both physically built, tested and identical in both repositories; H/I final owner model visual QA pending. F01-G previous three models received explicit owner PASS before this batch.

## Intent and appearance
The owner requested both final cream-white marble variants at once after approving F01-G. Both remain **single separate modular 1 × 1 × 0.06 m cream-white marble** pieces with 4 mm genuinely bevelled edges, same exact original owner-approved F01-A warm ivory/beige mineral basecolor PNG (SHA256 `81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98`). Frozen original F01-A GLB hash `787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147` unchanged.

- **F01-H (honed service matte):** real conventional four-sided solid 1 m marble slab, warm natural ivory veins, honed nonmetallic surface roughness **0.70**, extremely soft embedded normal-map texture for detailed soft studio highlights. Intended visual use: dry service/work paths (G-00L). Design-only; no service/transport logic.
- **F01-I (fine-textured wet-adjacent):** same original cream marble basecolor but much softer sheen (roughness **0.86**); nonmetallic micro-stippled normal map plus **a real 40 × 40 tessellated top surface**, gentle physical etching less than 0.7 mm deep, edges remain true 4 mm bevel. Visual use: wet-adjacent walkways near real pools, **not installed into canonical G01 and NOT a laboratory-certified slip-resistant surface**.

Artistic 3D images were generated in the user conversation for design review. They are visual references, not CAD evidence of exact friction or pixel-accurate lights/shadows.

## Provenance, hashes and actual binary bytes

Both assets are **actual GLB files, NOT placeholders**, committed in:
- Game development branch: `feature/lw-d-s7-f01-h-i-cream-marble-finishes-20261118`, physically at `assets/models/`.
- Builder `main`, physically at `assets/models/`.
- Shared original generator in both: `tools/b1/build-s7-f01-h-i-marble-finishes.py`.

| Model | Size | SHA256 (both repos) | Exact Git blob (both repos) |
| --- | ---: | --- | --- |
| `f01-h-cream-marble-matte-service.glb` | 175,632 B | `5a4a11975ed2319bda6fcf4a5532dc0b8c97e7da2d2ea768a963979e45293c67` | `f65657ef2e7a597b64e69a1c58efcdc8cf22e222` |
| `f01-i-cream-marble-fine-textured-wet.glb` | 459,472 B | `753eca2840d988a3dc9655b1d27ae9cde1c11cc81d1403c0a2ed692a4f1ad6ab` | `a53e20fb321aa403ae20085f3de543cb3183615a` |

### Verified
- Game build: [original dual-finish test PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/44251585406); three-dimensional mesh validity, exact frozen F01-A texture image, real embedded fine-grain normals and distinct H/I mesh/surface settings.
- Builder 47-model build and HTTP: [PASS](https://github.com/extreme4music-nexus/Trialum-3D-Builder/actions/runs/44251895051). Git blobs of both new models verified identical across repos.
- Builder catalog `assets/catalog.json`: 47 GLBs, **21 cream F01 GLB variants** A–I (including earlier halves, corners, edging and curved modules), 26 historical/derived non-F01 models.
- Builder owner-review project: `projects/trialum-f01-h-i-cream-marble-finishes-review.json`: H twice, I twice and the untouched approved original A in the middle. Open from upper dropdown **F01-H и F01-I · последни крем-мермерни плочки**.

## Important guardrails
- These last **planned model types** are built; this does not imply all F01-A..I obtained final individual owner model PASS. H and I still pending on-device visual confirmation and adjusting for pixel match as necessary.
- **Anti-slip** is a rendering/style designation only. Real-world friction and safety ratings require physical testing and certification; this game model carries none.
- No merge into Trialum game main, Classic, Android APK, Play Console, actual authoritative G01 paths, inventories or any game state.
- User instructions: preserve original finish and no shortcut assets, and Owner PASS wins for visual quality; automated tests confirm structural correctness rather than owner aesthetic approval.
- Next project family after owner H/I PASS: separate F02 black marble, then F03 grey-green stone, each via design render → owner review → genuine GLB → Builder QA. No automatic implementation of other families in this H/I delivery.

## Windows owner QA
Exit old Builder server; open **GitHub Desktop → Trialum-3D-Builder main → Fetch/Pull** after saving work. If previous `.git` lock errors recur, first run `CONNECT-GITHUB-WINDOWS.bat` safely and inspect the repository clone path; never delete uncommitted owner work. Start `START-BUILDER-WINDOWS.bat` → `http://127.0.0.1:8765/` → choose **F01-H и F01-I**. Orbit, inspect normal map microtexture and veining, compare two adjacent specimens per finish and original A; save any owner edits as design JSON.
