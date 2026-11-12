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

## Verified implementation and private three-APK device QA candidate — 12 Nov 2026

**SOURCE CI PASS, OWNER DEVICE QA PENDING.** [LW-C PR #41](https://github.com/extreme4music-nexus/Trialum/pull/41) merged to `main` as source commit `b0e0d473c3b0f71d3c6ac7022835100905df94ae`. Exact-source [Android/JS/1-10-100 autonomous sessions and unsigned builds PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43258641179), [server/security PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43258641426), [English translation PASS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43258642483).

Protected trusted-main signing **automatically** produced owner-signed v30 binaries and [artifact-only commit `c00c1ec`](https://github.com/extreme4music-nexus/Trialum/commit/c00c1ecd7e8261323ebea81ef11f61a85e1fcb9a), with all three exact-source `provenance.txt` records:

| App | Package / version | APK SHA-256 | Pinned certificate SHA-256 |
|---|---|---|---|
| [Trialum Release](../artifacts/android/Release/Trialum-release.apk) | `com.trialum.ziivaiskra`; `1.6-LW-dev.7` (30) | `474fcaf2c60826a1f79256913c22c72d09945bdebf648fb2e54d04a872e960b5` | `d8e646b45fcfeb68ec044bfa65157200c0d6962df6e81e97d54ce448f8af1a67` |
| [Signing QA](../artifacts/android/Signing-QA/Trialum-signqa.apk) | `com.trialum.ziivaiskra.signqa`; `1.6-LW-dev.7-signqa` (30) | `3fdfe4559a8f0212d4ba42fafad1637a5c1864b9f34cab3626c6fd5339b38ebb` | `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c` |
| [Friends Debug](../artifacts/android/Friends-Debug/Trialum-signdebug.apk) | `com.trialum.ziivaiskra.signdebug`; `1.6-LW-dev.7-signdebug` (30) | `f40ee83a8f24c9ca1f08c0d25863b54a2a5892046355a6e337c8b7d135def3cd` | Same permanent QA certificate as Signing QA |

**Device QA checklist:** Update all three existing v29 installed packages **in place**, never uninstall or reset data. In the local Playground, confirm a chosen pet is admitted, autonomous session status and its changing toy/activity/XP ledger appear, watch/replay gives no XP, early return produces a bounded, readable summary and places exactly one pet back home, and restarting or going offline preserves the same event ledger without duplicate XP. Verify previously owner-accepted LW-B scene isolation, saved-world backups and Android friend notifications still work. A full autonomous session is intentionally **30–110 real minutes** (first checkpoint 20% of planned duration); immediate 0 XP is normal. Independent review and explicit owner sign-off remain required before marking LW-C accepted; no LW-D, server deployment or public Play release is authorized.
