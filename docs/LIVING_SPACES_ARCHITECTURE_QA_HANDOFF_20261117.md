# TRIALUM LIVING SPACES — OWNER-APPROVED ARCHITECTURE / QA HANDOFF
Date: 2026-11-17
Work branch: `feature/lw-d-living-spaces-editor-20261117`
Draft PR: #95 (stacked after F01-E PR #94).
Builder: `extreme4music-nexus/Trialum-3D-Builder` main.

## Owner's actual goal
- Creator has an unrestricted, desktop-only GLB world builder. Designs are saved into the cloned Builder repo, and explicitly pushed/pulled from GitHub without keys in JS/browser.
- Later every player can customize **their own** permitted home rooms (furniture, decorative flooring, layout) while laboratories, infrastructure, inventories, other accounts and game engine remain under canonical authority.
- Much later pet AI may suggest/rearrange only **its own** marked furniture, with bounded actions, no arbitrary code execution, owner controls and durable memory. No pet should modify a friend's house.

## What is IMPLEMENTED now
- Shared source kernel in `js/living-spaces-core.js` and Builder `src/living-spaces-core.js`: schema v1, item owner and pet-owner boundaries, specific allowed actions, collision/bounds checks, undo/redo, no network/API gameplay writes.
- Isolated functional test page `prototypes/lw-d/living-spaces.html` + `living-spaces-demo.js`, reachable via **🏡 Дом · тест** in Classic and **🏡 Уреди дом · тест** in LW-D 3D shell. Isometric canvas, touch-first furniture add/move/rotate/replace/remove, localStorage save, JSON export and **simulated** pet suggestion with a pet-specific ownership gate.
- Unit tests: `tests/living-spaces.test.cjs`; existing game checks unchanged, translation `locales/en.json` updated in same PR.
- Builder `src/living-spaces-adapter.js` exports selected design to data-only Living Spaces JSON with source IDs/dimensions. It does not install the scene in the game.
- Builder desktop GitHub sync: localhost-only Python server checks origin and main, CSRF and explicit confirmation, Git commands restricted to layout assets. Instructions `docs/WINDOWS_GITHUB_TEST_CHECKLIST.md`.

## NON-CLAIMS / remaining production gates
1. TEST page is not yet the photorealistic GLB home scene; current visual is isometric UI placeholder. Live G01 and lab GLBs remain separate.
2. Pet button uses deterministic simulation, NOT an LLM or proactive background agent. Need opt-in and real memory/skills policy before any autonomous execution.
3. Only local single-device owner namespace is implemented. Need real player/habitat identifiers from the canonical engine, persistent backup/restore migration, multiplayer authorization and server-signed edit events before player rollout.
4. Need furniture GLB library, room physics/pathfinding clearance, item transform gizmo, drag/touch feel on Galaxy A55, save schema migrations and mobile performance budgets.
5. Browser localStorage preview is not a saved original world or cloud backup; do not claim continuity after reinstall.
6. No merge to game main, no public Play Store deployment until explicitly approved on-device. Build is a QA source branch.
7. Builder GLB sync currently covers confirmed F01 A-E; cannot claim all historical Trialum GLBs are inventoried.

## Acceptance tests (owner)
- Windows Builder launches with real F01 GLBs, proper mouse controls and no console/runtime errors.
- Select S7 Project (70 items). Change layout, Save to cloned Builder root; GitHub ↑ commits and pushes; GitHub ↓ retrieves clean upstream fast-forward. No PAT typed into Browser.
- In game test page, add multiple furniture types; collision and out-of-bounds moves refused; rotate, replace, undo/redo, device reload retains test layout.
- Pet owner-scoped simulation can move only marked furniture, not locked structural items or another pet's furniture.
- Signed QA Android artifact if CI finishes successfully must be installed/tested separately; source CI green ≠ owner device PASS.
- Never allow concurrent edit conflict to silently overwrite another user's history; real sync server remains a pending gate.

## Planned progression, deliberately not rushed
A. Builder Git roundtrip and true model preview owner PASS.
B. Canonical furniture/interior GLB library + actual 3D in-game renderer adapter.
C. Stable personal home IDs, permission enforcement on authoritative storage, offline merge rules and backup-safe migration.
D. Restricted player editor with save/undo and full acceptance testing on Android.
E. Opt-in pet-specific bounded AI suggestions, explainable approvals and one-pet-at-a-time behavior; memory and social visits only after established consent and security gates.

## Repo boundaries
- Trialum game is active development source on feature branch only; no beta or Android Builds repo modification by this work.
- Builder is a separate design tool and can push only its own cloned repo.
- Continue F01 model one family at a time with owner visual review and dual-repository manifest, but never treat a generator alone as a delivered binary.
