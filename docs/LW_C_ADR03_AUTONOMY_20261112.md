# ADR-03 / LW-C — Offline deterministic pet-led local playground (QA balance proposal)

**Date:** 2026-11-12. **Status:** proposed for internal QA, not a final economy balance approval. **Base main:** `66d53f5581b152b480b608315dcb52db56c6316b`. **Depends on:** owner ACCEPTED private functional LW-B v29, [evidence](LW_B_SCENE_ISOLATION_20261112.md).

## Contract and restrictions

One pet, one location from LW-A remains authoritative. **No server dependencies or new permissions**. The player's choices are unlock/upgrade the local playground, select a pet, send, watch (no XP for render), and return. The pet autonomously alternates observation, hesitation, rest and learned-skill practice using an immutable per-session seed and time checkpoints. Previously manually earned skill progress and play counts remain unmodified. Do not teach an unknown/locked skill by autonomous rewards.

## Provisional time balance (one local session, not permanent economy policy)

`base 30 minutes + 7 × (playground space - 1) + 6 × max(0, eligible unlocked equipment count - 2) + 4 × min(4, floor(max(0, level - 15)/10)) + 3 × min(4, floor(start energy / 25)) + 2 × min(4, floor(total previously learned skill proficiency / 3))`. Clamp total to `30..110` minutes; **never exceed LW-A local max 120 minutes**. Equipment eligible requires already unlocked, required research tier and pet level. All modifiers are integer and capped; re-evaluate and tune from physical gameplay observation before permanent economy approval.

Four deterministic checkpoints at 20%, 40%, 60% and 80% of the session's planned duration. Seed = stable hash of the immutable LW-A session ID, pet ID and start timestamp. Toy choice = deterministic index among a frozen sorted eligible-unlocked toy snapshot. Activity = deterministic choice of rest/hesitation/observation/practice. Only already-known skills may progress. **At most four awarded practice actions per session and four combined manual/automatic actions per pet per game day**. An actual rewarded practice reuses existing local `record()` which applies the existing energy floor, XP +4 and level/proficiency caps. An uneventful/visual frame earns **zero** XP. No wallet credit or remote effect.

## Atomic reconciliation and data flow

1. `send(s, now)` still calls LW-A `Presence.enter`, then saves a strictly additive bounded `playground.autonomy[petId]` record including version, sessionId, seed, startedAt, durationMs/endAt, starting energy, frozen eligible toys, `events[]`, and last observed timestamp.
2. On restore, load, foreground, and a visible 20-second tick, **settle before LW-A expiry**. For an admitted local pet with matching ID/session, process only unrecorded due checkpoints in order and append a durable event. A repeated callback at the same timestamp does not create another event or XP; a clock rollback grants nothing. Restart uses only saved events, never replays awards.
3. On elapsed end or explicit return, atomically finish the local presence and store a bounded summary ledger: time elapsed, toys used, action count, capped XP, skill before/after, energy difference, reason, and immutable sessionId. Keep a bounded history. A prior saved session with no LW-C record **must not be retroactively rewarded**.
4. Neither `render`, animation, nor `frameAt` changes XP; offline browsing and screenshot capture cannot accelerate simulation.
5. An untrusted local device clock cannot be made tamper-proof offline. The mitigation is finite sessions, a non-decreasing per-session observed timestamp, strict daily/session caps and **never sending client-earned XP as server-authoritative contributions**. Public leaderboards and paid acceleration remain out of scope.

## Required tests and release gate

- Deterministic same-seed 1/10/100 sessions, capped events/XP and snapshot idempotency; return once, no retroactive grants for older saves.
- Restart at mid-session, offline catch-up, two independent pets, canceled/early return, clock rollback, no unlocked/eligible toy bypass, manual-vs-auto cap, persistence of summary and no progress on rendered frames.
- Existing 1.5.6 playground/six-skill, LW-A presence and v29 signed certificate continuity regressions unchanged.
- Independent review, three Android owner-key variant CI, physical owner screen/backup/restart QA, explicit owner sign-off before `LW-C ACCEPTED`. Never touch production Debian or Play publishing; no LW-D before acceptance.

**Implementation mini-plan:** Extend `js/playground.js` and `js/app.js` only for bounded offline session state; update exact `locales/en.json` and its acceptance baseline if UI text expands; add `tests/lw-c-autonomy.test.cjs` and insert in existing CI; avoid changing `js/presence.js` (existing 2-hour emergency expiration remains a safety net), Android keys, social server, messages or migration scripts.
