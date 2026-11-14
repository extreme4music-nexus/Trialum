# LW-D L3 — INTERACTIVE LABORATORY COMPLEX
## Owner-approved next development direction • 14 November 2026

Status: **Architecture approved in conversation; implementation is NOT complete.**
Immediately preceding L2.3 owner test: automatic left World Atlas dismissal when tapping outside
was explicitly verified by the owner and reported **"тестирано и работи супер"**.
This is a specific UX PASS, not a sign-off for all L2.3, L3 or public Android release.

### Governing requirement
Trialum's entire game is progressively becoming a fully animated 3D environment.
**Complete the laboratory complex before advancing primary development to the biosphere.**
The laboratory complex contains exactly these five **real spaces**:

1. **Existing basic laboratory** — continue improving the already-working room, reactants,
   synthesis, analysis, materials and incubator; progressively replace primitive equipment.
2. **DNA laboratory** — separate 3D room with its own benches, unlock requirements,
   existing DNA/progression controller and visual operations. Never fabricate creature mutations.
3. **Food production laboratory** — separate room for **research and production** of food,
   with process visualization derived from existing resources and recipes; do not confuse
   with the food warehouse.
4. **Flora production laboratory** — separate room for plant propagation and relevant
   growth experiments; real in-game progress and capacity gates preserved.
5. **Research laboratory** — independent room/wing *within the same laboratory complex*,
   linked to existing discoveries, educational context and research progression.

**Food warehouse** is a separate gameplay space outside the laboratory complex;
it will physically store/track food, stocks, production output, nutrition and reserves.
Do not label the warehouse a laboratory, and do not silently replace today's food UI.

### Implementation slicing — strictly sequential, owner QA per slice
- **L3.0 Complex spatial foundation:** central circulation area with five distinct visible
  and labeled entrances, 3D camera travel, spatially meaningful scale, safe controls and
  zone-aware holographic HUD. Former four working lab stations and live state remain intact.
  Entrances to rooms not yet built are honestly labeled as in development; user can access
  each original 2D function. Fix camera crossing back walls, clipping and occlusion.
- **L3.1 Basic laboratory visual fidelity:** nonprimitive distinctive original machinery,
  metal/glass/ceramic detail, local light/material variations, observable reaction **inside**
  each machine, realistic close focusing for game readability (not scientific-accuracy claims).
- **L3.2 DNA room:** fully distinct working room, existing feature gates and proper own data.
- **L3.3 Food-production room:** separate equipment, workflow and production milestones,
  existing supply/game progression maintained.
- **L3.4 Flora-production room:** controlled grow chambers, plant animations and existing flora logic.
- **L3.5 Research wing:** integrated experimental science and real game research.
- **L3.6 End-to-end gate:** Android physical QA, WebGL2, accessible touch & back navigation,
  content localization, battery/GPU foreground/background, offline/AI-OFF, unchanged game
  identifiers, prior saves and backup restore; owner specifically signs off.

### Unbreakable data and delivery policy
The original Trialum engine remains sole truth: new 3D spaces are read-only scenes plus
validated intents to existing controllers. No second XP economy, DNA state, pet IDs or
independent science game. Preserve server/auth/social/AI state, world history, backups,
Android package IDs, signing policy and Play Console work. Main and release branches do
not receive partial L3 changes without owner acceptance; use draft PRs.

The user wants a gradual development, but **every existing feature stays reachable** via
the hierarchical World Atlas until its real 3D replacement passes owner acceptance.

### Current dependency graph
L3 branch originates from L2.3 owner-tested work, which in turn depends on L2.2 hologram
HUD, L2 laboratory room and D0/D1 scene bridge. Preserve current draft PR chain until
reviews/merges are explicitly approved; no destructive rebase or broad merge of LW-C.
For the later LW-C beta handoff, read [LW_C_TO_LW_D_INTEGRATION_PROTOCOL_20261114.md]
(LW_C_TO_LW_D_INTEGRATION_PROTOCOL_20261114.md).

## L3.0 implementation status (14 November 2026)

Built new `prototypes/lw-d/lab-complex.js`: original enclosed/cutaway laboratory corridor with floor tiles, perspective depth, lighted piers, a navigation island and five visually distinct interactive doorframes. The **basic laboratory** leads into the pre-existing working four-machine room; DNA, food production, flora and research entrances clearly remain in development and route to the **original functional classic modules**, not fictitious 3D replacements. Optional in-game World Atlas now contains an explicit `3D ходник на лабораториите` entry; the lab HUD offers the same, accessible buttons and return-to-basic path. The renderer uses in-memory room selection only, not an additional save state.

**Need owner QA:** Android 3D geometry/framing, tap accuracy (door rectangles versus camera perspective), return to basic lab, native back navigation, MK/EN labels, older-state resource continuity and smooth framerate. Core progress, backup/restore, signers, social server and LW-C remain unchanged. This slice is not a complete laboratory complex; L3.1–L3.6 remain open.

## Owner physical Android test — 14 November 2026, 08:48 local

Video: `Screen_Recording_20261114_084825.mp4`, 27.81 s, Galaxy landscape 2340×1080.
Owner's explicit status: **"Супер. Операција успешна."**
Treat **L3.0 core flow as owner-accepted** for the features actually shown on video:
- central five-entrance 3D corridor renders and the return to the basic four-station
  laboratory is visibly functional;
- the original laboratory HUD, camera orbit, focus/zoom and player resource labels work;
- synthesis action is evidenced by molecules increasing from 2,266 to 2,274 and
  insight from 2,417 to 2,419 in the recorded session;
- fullscreen scene and previously owner-approved menu dismissal do not show an
  obvious ongoing block to these actions.

**Not independently evidenced by this clip:** selecting every one of the four
in-development doors, detailed backups/restores, long-session performance, native
Back/gesture recovery, resource persistence after full app restart, signed release.
None of those should be marked PASS based on this video alone.

**Watch item for upcoming device QA:** Near the end (~26 s), the captured screen
shows a standalone D0/preview-like laboratory UI with zero demo metrics and
controls. It is unclear whether the user deliberately navigated to a standalone
preview or whether a WebView navigation/history edge case exposed it. Do not treat
it as evidence that real world resources were reset; the earlier world snapshot
still shows stable resources. Before merging or promoting L3.1, test Return to
classic, Home/back gesture and reopening the immersive scene explicitly.

### Next slice L3.1 — basic laboratory first
A single high-fidelity laboratory interior pass: more identifiable physical
reactors, sample vessels, moving analysis hardware, illumination local to
experiments, in-machine process feedback, scale-correct spatial layout and
camera-safe focus. Visual simulation must reflect existing engine outcome and
must never mint game resources. The other four L3 rooms remain in-development
and reachable via classic functionality.

## L3.1 working slice — original machine detail and chamber-local reactions

Status: **implemented in an isolated Draft branch**, automated tests green at first gate; **not owner-approved or device-verified yet**.

- New `prototypes/lw-d/lab-detail.js`: visually distinct reactor with induction coils, valves, reaction vessel and sample tubes; translating analysis scanner and readout; material-sorting conveyor, shelves and balance; three cell-incubation capsules with bounded pulsing culture shapes.
- More material variety within existing WebGL2 shader: brushed metal, glass-like *opaque* polymer and luminous accents. This is still a procedural stylized model, **not transparent 3D glass or photorealism**.
- `lab-process.js` now draws short, outcome-dependent, contained visual replay at each actual machine: reaction in reactor, scan over sample, conveyor movement and incubator cell cues. Failed engine actions get local amber warning instead of a false success. Post-action replay **never changes resources or creates a new real-time simulation**.
- The selected-station camera now approaches all four stations from the central/front aisle. The original `TrialumEngine` game actions, station IDs and resource values, save schema, backups, AI and social server are unchanged.
- New visual asset is bundled in standalone offline HTML, PWA cache and isolated Android QA `.lwd1`; no new network dependencies, private keys or Play signing.
- Six dedicated tests verify model geometries, action-result source, localization of process particles, failed outcomes, safe approach and packaging. Prior simulations, history and classic functionality remain available.

### Owner QA required before calling L3.1 accepted

1. Record all four machine closeups on physical Galaxy A55: reactor, analyzer, material station and incubation.
2. Trigger all four actual actions, including resource changes and a failure (if safely possible), then inspect animations inside corresponding machines.
3. Verify pinch/orbit does not pass through back wall and five-door L3.0 hall navigation still works.
4. Hide/reopen holographic HUD, return to classic, app background/foreground, backup/restart preservation.
5. Check screen readability/framerate and whether the models look mechanically meaningful rather than blocky. This remains an intermediate graphical quality gate.

Next: improve instruments based on owner video, then L3.2 DNA laboratory as its own fully functional 3D room. LW-C beta integration must wait for an exact source SHA and accepted feature-by-feature handoff.
