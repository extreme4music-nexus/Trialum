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
- `js/app.js`: explicit home-scene tab visibility mode on navigation; preserve existing Lab opening scene, menu/selected pet/care tab controls.
- `js/world.js`: requestAnimationFrame begins only after validated world loaded, with one pending frame maximum; cancel while not selected, document hidden or outside viewport; resume on actual visibility. Honors reduced-motion on future frame scheduling; does not alter `frameAt()` exports.
- `assets/style.css`: `[hidden]` world panel occupies no scroll height.
- `tests/ui.test.cjs`: DOM navigation tests for home-vs-shared-vs-local visibility; fake RAF scheduler proving pause/resume, zero off-tab pending frames and no duplicate frame scheduling.

**Explicit nonchanges:** No Android signer, Firebase, messages, quotas, server/database, saved-world JSON schema, XP, pet presence/movement, world simulation clock, public Play Console operation or work on LW-C.

## Acceptance gates
1. Android/JS/UI CI and exact English sync PASS on the branch; independent code review for visibility observer and WebView focus/scroll regressions.
2. Device screenshot/portrait and landscape checks: home only in Lab/Habitats; no home world above local/shared playground; care and backup controls remain reachable; no blank initial game.
3. Measurable A/B evidence of hidden rAF (source regression validates zero queued loops; future device profiling can record CPU/battery comparison).
4. Gate B remains **IN_PROGRESS** until viewport/scroll audio/secondary renderers, reduced-motion and device checks all pass. This slice is not public release or overall LW-B acceptance.

**Never silently merge a non-green PR or publish an installable APK from a PR branch; protected `main` signing already operates automatically on accepted merges.**
