# S7 GLB dual-repository delivery contract — 2026-11-17

Owner decision: every newly created **real** .glb asset must be available in BOTH:
1. This active Trialum S7 branch (canonical original model generator, frozen output hashes / QA; **do not merge game main automatically**).
2. `extreme4music-nexus/Trialum-3D-Builder` `main` (exact model files under `assets/models/`, catalog entry and a reproducible generator; owner retrieves by GitHub Desktop Fetch → Pull).

Current model family: original S7 F01-A (1), B (2), C (4), D (4), E (4) = **15 distinct GLBs**. Sources on this branch:
- `tools/b1/build-s7-f01-marble.py`
- `tools/b1/build-s7-f01-half.py`
- `tools/b1/build-s7-f01-quarter.py`
- `tools/b1/build-s7-f01-edge.py`
- `tools/b1/build-s7-f01-corner.py`.

Builder has the same five generator sources; workflow builds the 15 binary files from original source and commits them to Builder main after checks. **Do not mark it complete before its GitHub Action succeeds**.

Production Builder JSON: `projects/trialum-s7-f01-production.json`; 70 model instances on a dry asset staging pad, **not** the approved G01 scene or measured G00L furniture placement. It deliberately does not write gameplay state. Owner can edit/push separately.

**For each subsequent GLB:**
1. Develop and validate one model family on the active Trialum feature branch, record SHA256 and provenance; keep its runtime integration isolated.
2. Mirror source generator, exact binary output, canonical filename, dimensions, placement pivot/axes, hash, status, and catalogue to Builder main. Prefer reproducible CI generator and check in actual GLB outputs; generator-only or ZIP-artifact-only does not count as availability for GitHub Desktop.
3. CI verify every catalogued GLB physically exists and is valid glTF2. Reject missing/mismatched binaries. Distinguish owner-approved versus CI-reviewed/pending.
4. Do not alter the user's saved JSON, automatically add new components to the live scene, change Classic, alter inventory/FCM, or push Google Play.
5. Report the two commit refs and owner visual validation status before claiming synchronization finished.

**Scope limit:** other historical 3D GLBs in earlier game branches / CI artifacts must be enumerated and mirrored separately; this contract does NOT claim the F01 collection is the entire historical 3D asset collection.
