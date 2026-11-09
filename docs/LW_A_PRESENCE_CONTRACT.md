# TRIALUM LW-A — Pet Presence Contract, Integration and QA

**Status:** IN_PROGRESS — SOURCE BETA. **Not accepted / not merged / not deployed.**  
**Created:** 2026-11-09. **Branch:** `feature/trialum-lw-a-pet-presence-20261109`.  
**Parent:** planning branch `docs/trialum-living-world-roadmap-20261109`, based on `main` `d972c17f569dc3b13029cf8fa7f31119fa33f5a6`.  
**Source roadmap:** [TRIALUM Living World Roadmap](TRIALUM_LIVING_WORLD_ROADMAP_2026.md) → LW-A.

## 1. Purpose and boundaries

One pet = one current physical location. Existing `habitatId` remains the pet's permanent **home assignment**, not the current live location. Preserve all local game states, legacy saves, old-world imports and offline solo gameplay. **Do not** change XP balance, implement autonomous play, redesign navigation, turn on billing or change production infrastructure in LW-A.

The owner explicitly approved beginning LW-A on 2026-11-09. Owner sign-off for *completion* is separate and remains pending.

## 2. Additive on-disk data (no global game-version bump)

Each pet may carry `presence`:
```json
{
  "version": 1,
  "kind": "home",
  "status": "active",
  "sessionId": null,
  "ref": null,
  "startedAt": null
}
```
`kind` is one of `home`, `local_playground`, `shared_playground`, `visit`. A remote entry begins `pending`, then becomes `active` only after an authenticated network admission read succeeds. An independent `presenceSequence` in the local world creates one-time local session identifiers; `sessionId` must match on completion/return/rollback. `ref` is the authorized shared room or visit ID and is absent for HOME/local.

**Migration:** a legacy pet without presence is `home`. Existing `id`, `habitatId`, species, name, age, skill level, XP, currencies, journal, friendship metadata and save version are unchanged. Round-trip JSON preserves presence and session sequence. No new centralized account or forced online migration.

**Home-only controls:** feeding, care, direct training, cognitive action, DNA transformation, local transfer and P2P socialize are disallowed while the pet is away. Home habitat canvas filters by presence; pet capacity remains reserved at home (separate future economic decision).

## 3. Transition table

| Prior | Request | Result | Important rule |
|---|---|---|---|
| legacy/no record | normalize | HOME / active | no progress loss |
| HOME | send to local playground | LOCAL / active | immediate offline local operation |
| HOME | send to shared room | SHARED / pending | fetch authenticated room snapshot and authorize membership |
| SHARED / pending | admission success | SHARED / active | only same session ID confirms |
| SHARED / pending | admission failure | HOME | only pending same session ID rolls back |
| LOCAL / active | return home | HOME | same session ID required |
| SHARED / active | return home | HOME | same session ID required; server lease still not implemented |
| HOME | any return | HOME | idempotent no-op |
| any away | send to elsewhere | error, unchanged | no teleport/cloning |
| accepted outbound visit | read back through authenticated visits | VISIT / active | only the original sender's local pet; no client-side XP |
| visit declined/returned/expired | authenticated server reconciliation | HOME | requires current server report |
| offline / network error | keep last confirmed remote status | unchanged | no silent re-admission, retry later |

**Server authority implemented in source, NOT deployed:** `server/sql/006_pet_presence.sh` adds a uniquely indexed installation+pet lease. `server/src/presence.mjs` and `shared.mjs` add authenticated atomically serialized enter/return/renew, reward authorization, visit acceptance/expiry and room occupants sourced from live leases. `social.mjs` revokes leases when friends are blocked/removed. Existing API ignores/enforces the new schema only when `TRIALUM_PRESENCE_ENABLED=true`; default OFF prevents surprise impact to older clients. CI on an isolated ephemeral PostgreSQL database verifies concurrency, replay, reward limits, visits, blocking and expiry. **Still not accepted:** owner-server migration (backup + separate restore drill), live 2-phone QA, and independent approval. See [LW-A server migration 006](LW_A_SERVER_MIGRATION_006.md).

## 4. UI integration (current source)

- `js/presence.js`: pure state machine and engine wrappers, explicit return/rollback, optional remote admission confirmation.
- `js/playground.js`: explicit Send/Return, disabled toys until locally admitted, no pet drawn in local scene if absent.
- `js/world.js`: render only HOME pets assigned to current habitat.
- `js/app.js`: indicate current presence; block home-only care and persist location changes.
- `js/shared-playground.js`: use authenticated server lease to confirm shared room entry/return and reward requests, renew active session, and reconcile own active visits/shared lease after restart; failed/uncertain requests remain pending until authoritative refresh.
- `js/shared-scene.js`: render all shared occupants from server-active leases rather than historical event ghosts; accepted visits require a valid visit lease.
- `index.html`: load presence module after patched engine and before playground/world.

**LW-B, not this phase:** relocate/hide the entire home aquarium when the Playground tab is active, eliminate scrolling and pause nonvisible render loops. LW-A only removes duplicate *pet sprites*, not the persistent habitat container.

**LW-C, not this phase:** autonomous toy selection, timed play, real-time offline session award and skills summary. LW-A preserves existing manual, bounded practice **only after explicit Send**.

## 5. Test matrix and evidence

Automated, on this feature branch:
- `node --test tests/presence.test.cjs`: migration, one-place invariant, stale-session rollback/return, remote confirmation, JSON round-trip, home-only eligibility.
- `node tests/playground.test.cjs`: existing solo skills/economy regression plus explicit send/return and restart.
- `node --test tests/release-f-gates.test.cjs` and all workflow game tests: no save/upgrade regression.
- `node --check js/*.js` and Android SDK36 CI assembly; verify presence module inside APK.

Owner physical test steps, **all PENDING**:
1. Export JSON from a current installed game; keep separate offline copy; do **not uninstall** because signing may differ.
2. Install an authorized test APK with matching signature or on a separate test phone/profile; import and compare pet names, habitats, levels, skills, XP, credits and logs.
3. Send Pet A to local playground: Pet A disappears from home while Pet B remains; local gameplay and spectator canvas show Pet A.
4. Attempt feed/training/transformation of away pet: rejected without resources/XP changing; send same pet to shared room: rejected until return.
5. Force stop app, restart offline, reopen: Pet A still local; return and re-send works exactly once. Test repeated taps and restore JSON from backup.
6. With two private accounts/phones, enter shared room and try duplicate admission, leave, block, expire and reconnect. **Server-lease test must fail/mark BLOCKED until implemented.**
7. Send visit to friend: pet stays home while invitation is pending; on confirmed acceptance and successful sync, pet moves to VISIT and disappears from home; return/expiry restores home.
8. Test offline/online toggling and low-battery restart; never lose an existing local world.
9. Test old English tester and other locales; no raw error/no clipped buttons.

**QA verdict:** pending independent tester, owner sign-off and server-authoritative presence. No production release; no living-world feature branch merged.

## 6. Anti-loop ledger

| ID | Requirement | State |
|---|---|---|
| LW-A-01 | Document state/transition schema | SOURCE DOCUMENTED |
| LW-A-02 | Migration/idempotency tests | SOURCE WRITTEN; CI must be tied to final SHA |
| LW-A-03 | Local presence engine and action guards | SOURCE IMPLEMENTED; real-device test pending |
| LW-A-04 | Local/shared UI wiring and visual exclusivity | SOURCE IMPLEMENTED; 2-phone/server authority pending |
| LW-A-05 | Database-atomic server sessions, return/revoke/reconnect | **SOURCE IMPLEMENTED; CI PASS; LIVE MIGRATION / 2-PHONE QA PENDING** |
| LW-A-06 | Owner backup/restore, independent QA, sign-off | **PENDING** |

**Advance rule:** Do **not** begin LW-B, merge to main or label LW-A ACCEPTED until A-05/A-06 pass on owner Ubuntu and two real Android devices, and the owner explicitly approves. Failed assertions receive reproducible defect IDs, not an unplanned new roadmap.

## 7. Change log

- 2026-11-09: Initial additive presence module, local and shared client integration, guards and regression tests in isolated source branch. Server-side PostgreSQL 006 and lease API added; tested by disposable CI only. No changes to production Ubuntu, NAS, DB, secrets or Google Play. Owner previously confirmed local gameplay on an earlier beta APK; the updated server-aware client requires a separate device QA pass.
