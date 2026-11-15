# TRIALUM LW-D L3.7 — REAL-ENGINE RESULT→3D VISUAL PARITY AUDIT
**Owner direction:** continue canonical L3.7, one step at a time; date 2026-11-15.
**Branch:** `feature/lw-d-l3-7-laboratory-life-reactions-20261115` / Draft PR #71; **not** main.

## Existing authoritative code (DO NOT build a duplicate engine)
- `js/app.js` exposes `TrialumLWBridge` to the same-origin nested 3D scene. The original `TrialumEngine` and original save remain sole authors of resource/pet/food/flora/research transactions.
- `js/lw-d-interface.js`: validates exact `postMessage` iframe source and origin, whitelists original operations, snapshots before/after, invokes real engine once, sends a result message to the child and syncs an updated read-only saved-world projection.
- `prototypes/lw-d/live-context.js`: HUD initiates actions; trusted parent replies are translated to CustomEvents. The engine message is the *only* legitimate source of new success/failure effects. Updating the saved-world snapshot must NOT trigger an effect.
- `prototypes/lw-d/event-reactions.js`: currently normalizes result events to a read-only room/op/ok feedback for positional SFX, but has no monotonic event identity, replay suppression or render liveness checks.
- `prototypes/lw-d/world.js`: preserves hub-first architecture, draws all rooms and consumes the result events. `canRender()` already gates WebGL RAF to visible app; transient result objects are not systematically cleared on room switches/background.
- `prototypes/lw-d/lab-process.js`: four complete existing L2 Basic Lab reactions, ~2.4–3.5 seconds, in real physical workstation geometry, success/failure paths, pure before/after `change`, no timers/save/XP. **Preserve and extend**, do not rebuild Basic.
- `prototypes/lw-d/dna-room.js`, `food-room.js`, `flora-room.js`, `research-room.js`: have existing short event-driven glow/failure cues. Current renderer passes transient `{op,ok,started}`, but does not yet guarantee dedupe or clearing on room leave. Later L3.7-C follow-on.
- `prototypes/lw-d/spatial-audio.js`: native Web Audio camera-oriented HRTF sound for confirmed action results; user-reported prior total silence corrected in signed run #123, but **physical phone audio OWNER PASS is still pending**.

## Strict B slice — Basic Lab (implement now)
1. A monotonic **presentation-only result sequence** from the trusted parent for each operation (Basic first; pass all five room results for later C). Never write it to saved game/DB, no new state mutation.
2. Pure, bounded, read-only event tracker accepts only whitelisted, strictly new, trusted original engine results. Visibility and room/scene matching are checked before presenting them; entering/resuming scene must NOT replay stale result.
3. Keep already accepted original four Basic 3D machine visuals; pair them with a short positional 3D HUD response using the actual relevant before/after metric. Failed actions must never display invented `+resources`; zero delta is not a reward.
4. Clear transient Basic graphics and HUD on leaving room, going background, losing WebGL or closing view. No new background poller/timer/economy/pet/AI system.
5. Automatic tests: transaction sequence correlation, duplicate/out-of-order suppression, hidden-room drop, success delta, failed/locked zero gain, short lifetime, MK/EN content, legacy room visuals intact and fully offline Android bundled.

## Deferred C slice — specialist rooms (next, sequential)
- DNA: confirm pet identity and accepted design/transform; no holographic fake pet. 
- Food: show actual recipe/portions/stock changes on successful craft/feed; fail never shows added servings.
- Flora: selected plant/habitat identity and confirmed planted/discovered results, no unsupported instant growth.
- Research: original study/upgrade/invent/craft result and genuine tier/material discovery, no invented research points.
- Lobby: subtle **confirmed** event echo and current saved-world indicators only; nothing replayed while offscreen.
- The complete model/material/render remaster, mini-city/social pet homes and unrelated server modifications remain intentionally out of scope.

## Staging / acceptance
- L3.6 owner PASS preserved; L3.7 audio #123 automated PASS but phone result unreported; L3.7 visual B source and QA must be separately checked.
- Only existing `com.trialum.ziivaiskra.signqa`, signed automatically by GitHub Actions trusted owner lane. No local signing, new Firebase app, Release/FriendsDebug, Play, server, DB or main merge.
