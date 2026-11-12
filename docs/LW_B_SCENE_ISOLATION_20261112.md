# Trialum 1.6-LW-B — Scene isolation and visible-only rendering (phase slice 1)

**Date:** 2026-11-12. **Priority:** Move forward from owner-accepted private LW-A functionality and verified Android message notification fix. No new Firebase or message-limit work.

## Phase boundary and owner evidence
- [LW-A offline owner QA #32](https://github.com/extreme4music-nexus/Trialum/issues/32) was closed with explicit private-scope acceptance of safe offline home return and named room participant unavailability. PR #26 integrated finite session/expiry source with passing CI; historic 10-Nov "NOT IMPLEMENTED" labels are dated, not current code status.
- [Android message notifications #33](https://github.com/extreme4music-nexus/Trialum/issues/33) owner PASS in signed 1.6-LW-dev.5 / v28; no remaining message push symptom blocks LW. Independent/public-release audit coverage is a separate gate.
- [Message rate-limit observation #39](https://github.com/extreme4music-nexus/Trialum/issues/39) explicitly **deferred** by owner; DO NOT change message quotas or deploy a server patch.
- Remaining broader LW-A restore/independent security/multi-device matrix is retained as **pre-public-release assurance**, not falsely represented as performed by this LW-B source patch.

## LW-B first incremental slice: exact source scope

**Goal:** Home habitat canvas belongs to initial Lab/Home and Habitats views only. Local/Shared playgrounds and other tools show their own content, not a duplicated sticky aquarium. Home painter must do **zero RAF repaint work** while hidden/background/off viewport, while game simulation time and saved pet states keep their existing owners.

Files changed:
- `js/app.js`: explicit home-scene tab visibility mode on navigation; preserve existing Lab opening scene, menu/selected pet/care tab controls; reset sticky aquarium swipe-state on leaving/entering Home, and mark current primary nav destination with `aria-current=page`; skip hidden 20s UI/simulation ticks while reconciling elapsed simulation time on normal foreground/restore.
- `js/world.js`: requestAnimationFrame begins only after validated world loaded, with one pending frame maximum; cancel while not selected, document hidden or outside viewport; resume on actual visibility. Honors reduced-motion on future frame scheduling; does not alter `frameAt()` exports.
- `assets/style.css`: `[hidden]` world panel occupies no scroll height.
- `js/playground.js` and `js/shared-scene.js`: independent local/shared playground animation loops now suspend while backgrounded or off viewport, resume only when visible, and cancel on leaving the screen. No game-state simulation or XP clock is modified.
- `js/audio.js`: pause ambient timer and on-device creature audio during WebView backgrounding while **preserving** the player's saved sound/music preferences. Resume only previously enabled music.
- `tests/ui.test.cjs`: DOM navigation tests for home-vs-shared-vs-local visibility, sticky-scroll state reset and accessible active navigation; fake RAF and IntersectionObserver schedulers proving pause/resume and zero off-tab/off-viewport pending frames for **all three canvases**, without duplicate loops; background audio timer safety checks.

**Explicit nonchanges:** No Android signer, Firebase, messages, quotas, server/database, saved-world JSON schema, XP, pet presence/movement, world simulation clock, public Play Console operation or work on LW-C.

## Acceptance gates
1. Android/JS/UI CI and exact English sync PASS on the branch; independent code review for visibility observer and WebView focus/scroll regressions.
2. Device screenshot/portrait and landscape checks: home only in Lab/Habitats; no home world above local/shared playground; care and backup controls remain reachable; no blank initial game.
3. Deterministic pre/post code baseline: the old home scene queued a new RAF unconditionally; old local/shared loops also scheduled while hidden; with LW-B off-tab/off-viewport all three have **zero pending frames** after cancellation. This is source scheduling evidence, **not a claim of measured Galaxy A55 FPS/battery savings**. Profile on physical device before owner sign-off.
4. Gate B remains **IN_PROGRESS** until viewport/scroll audio/secondary renderers, reduced-motion and device checks all pass. This slice is not public release or overall LW-B acceptance.

**Never silently merge a non-green PR or publish an installable APK from a PR branch; protected `main` signing already operates automatically on accepted merges.**

## Latest exact-source automated CI evidence — 12 Nov 2026

The latest LW-B **code** commit `3465090cfad71ff8363dee4b67fdaa185c81c0b2` (PR #40) completed:
- [Android JS/UI world, backup, identity, local/shared paint and **unsigned candidate** builds — PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43241354960).
- [Server social/security regression — PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43241355037).
- [English UI synchronization — PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43241355237).

Protected **owner signing and artifact Git publication intentionally SKIPPED on the PR**, correctly withholding all installable APKs until reviewed source reaches trusted `main`. Existing signed v28 remains unchanged. Before an owner QA build/merge, allocate a fresh monotonically larger Android `versionCode` (never silently replace installed v28 with different bytes under the same code) and update the existing exact-version workflow/test assertions. Keep pinned Release/QA certificates unchanged.

**Do not mark LW-B ACCEPTED yet:** source CI is green, but independent UI/reviewer assessment, portrait/landscape/safe-area and accessibility checks, actual Android viewport/return-from-background, screenshot and copy-restore safety verification, and performance evidence on owner hardware are not yet reported. Final acceptance remains an explicit separate owner gate.
