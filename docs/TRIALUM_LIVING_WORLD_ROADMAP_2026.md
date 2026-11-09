# TRIALUM — Living World Roadmap (2026–2027)

**Status:** OWNER-ACCEPTED DIRECTION / DOCUMENTATION READY FOR REVIEW. **Implementation: NOT STARTED.**  
**Decision date:** 2026-11-09. **Source baseline:** main at d972c17f569dc3b13029cf8fa7f31119fa33f5a6.  
**Owner:** project owner. **Independent QA:** invited external musician / US English tester.  
**Canonical index:** [PROJECT_ROADMAP.md](../PROJECT_ROADMAP.md). Existing 1.5.6 security/release gate remains authoritative for unresolved public-release risks: [1.5.6 F gate](V1.5.6_F_RELEASE_GATE.md).

> **Македонско резиме:** Целта е миленичето да има сопствен живот, место, време, интереси и пријателства. Играчот создава услови, отклучува можности и се грижи; миленичето самостојно живее. Развојот оди строго по фази со тестови и докази. Ниту еден нов систем не смее да ги избрише постоечките светови или да го расипе офлајн играњето. Овој документ е план, не имплементација и не одобрување за Play Store.

## 0. Product north star and scope

**“You create the world. Life in it grows on its own.”** A durable, age-appropriate, offline-first life simulation intended to be enjoyable across generations (roughly ages 6–66 and beyond). The player is a guardian and creator, not a button operator commanding every animation.

This roadmap records **all 15 accepted tester requests**, provides a single implementation order, explicitly separates **first-public-release candidates** from **later expansions**, and defines verifiable phase exits. Additional tester ideas go into a backlog without silently changing active-phase scope.

**One source of truth:** this document owns the new Living World initiative (LW). The root roadmap links here. Existing 1.5.6 release, privacy and migration docs continue to govern their historical/current components; never copy contradictory status claims into new files.

**Never claim a date as a release guarantee.** The owner's expected Play Console budget window is approximately one week after 2026-11-09; account setup, verification, testing eligibility and independent QA may take longer. A paid developer account is not proof of publishing eligibility or game readiness. Do not skip quality gates to meet the date.

## 1. Confirmed starting point and constraints

- Existing engine, saved local worlds, evolution, species, skills, local playground, shared playground, friendships and messages must remain backward-compatible.
- Local game state uses IndexedDB with localStorage fallback and JSON export/import. Full locally saved pet history must survive upgrades.
- The world Canvas currently has a continuous animation loop; the local and shared playground have separate rendering/control paths. Presence and return are not yet modeled as one cross-feature authority.
- The server is for optional authenticated friends, shared room/visits, messaging and server-authoritative shared events; **do not move the complete game or private pet history to the server**.
- Owner reported on 2026-11-09 that the home-server SQL 001/003/004/005 migrations and associated functions were manually exercised and profiles/shared playground/messages opened. Treat as **operator-reported smoke testing**, not a documented restore rehearsal or multi-phone certification. HTTPS endpoint was reported working through Caddy. No database, server, router or NAS change is authorized by this documentation phase.
- Last *confirmed diagnostic* reported push DISABLED and free-text ENABLED. A later trial command was suggested, but no result was provided: **current actual push/free-text values are UNVERIFIED**. Keep free-form messaging disabled for external/child-facing testing until a separate safety review. FCM and its real opt-in flow remain open release gates.
- US English tester APK/localization is a separate test branch and does not certify complete translation. It must not be accidentally overwritten by Living World work.
- No ads SDK, no third-party tracking, no forced Google sign-in, no real-money payment implementation, and no silent GPS collection.
- The current 1.5.6-F source RC is **NOT approved for public Play Store release**. This initiative must not change that verdict without evidence.

## 2. All tester proposals — tracked once

| ID | Accepted requirement | Primary phase | First public release? |
|---|---|---|---|
| T01 | Pet cannot simultaneously appear at home and in local/shared playground | LW-A | **Required** |
| T02 | Playground view must not display the home habitat/world | LW-B | **Required** |
| T03 | Habitat visible only on Home/Habitats; drastically reduce navigation scrolling | LW-B | **Required** |
| T04 | Optional spectator view: animated pet plays and explores on-screen only | LW-C with LW-B rendering rules | **Required** |
| T05 | Autonomous toy choice, bounded XP/skill progression, result summary on return | LW-C | **Required** |
| T06 | Session duration scales with unlocked playground/toys and *individual* pet level/energy | LW-C | **Required** |
| T07 | Slow observational skill learning from other players' pets | LW-E | **Deferred** |
| T08 | Smooth visible-only animation; minimal background work; optional measured WebGL | LW-B / LW-D | **Required baseline** |
| T09 | Better-quality licensed/original ambient music, several tracks, varied loops | LW-D | **Required basic version** |
| T10 | Scheduled birthdays, invited pet guests, token-priced party size in shared area | LW-F | **Deferred** |
| T11 | Persistent inter-pet social ties, pet-originated visit requests with owner approval | LW-E | **Deferred** |
| T12 | Multi-hour real-time sleep/rest cycles | LW-F | **Deferred** |
| T13 | Habitat items: hygiene tools, TV, console, desk, learning equipment | LW-F | **Deferred** |
| T14 | Day/night/seasons tied to local time and optional coarse region | LW-F | **Deferred** |
| T15 | Earned-token item shop, progressive content unlocks | LW-F | **Deferred** |

**Scope freeze:** No new proposal enters an already active phase unless it is required to close a documented safety/data-loss blocker. Other additions receive T16+ / BACKLOG IDs and are prioritized *after* the current gate.

## 3. Sequential delivery map

| Gate | Focus | Depends on | Outcome |
|---|---|---|---|
| **LW-00** | Canonical roadmap, baseline hash, release blockers, QA evidence format | Existing main | This **documentation-only** branch |
| **LW-A** | Single pet presence + safe saved-state migration | LW-00 | Pets occupy exactly one place, recover safely |
| **LW-B** | Habitat/playground screen separation + lifecycle-aware rendering | LW-A | Clean navigation, no duplicate visual pet, no hidden infinite animation |
| **LW-C** | Autonomous local playground simulation + summary/economy | LW-B | Offline background-time progression with bounded and auditable XP |
| **LW-D** | Presentation and sound polish, real-device performance gate | LW-C | Smooth visible animation, several authorized audio tracks |
| **PUBLIC RELEASE GATE** | Reconcile with all unresolved 1.5.6-F manual/security/Play requirements | LW-A–D + operator/independent QA | May be considered only after independent evidence and explicit owner approval |
| **LW-E** | Social observation/imitative learning + pet friendships | LW-D (may follow beta independently of publishing) | Consent-based, server-validated, slow social progression |
| **LW-F** | Sleep, furnishing, optional real-world ambience, birthdays, earned-token shop | LW-E or independently decomposed later by ADR | Feature-gated post-launch extensions |

**Version policy:** LW-* are milestone identifiers, **not** APK version names, Git tags, or automatic releases. Allocate versionCode/versionName only when approved for a build. No unapproved public tag, store upload or promise that all LW-E/F items will fit into the first release.

## 4. Phase contracts (definition of done)

### LW-A — Single source of truth for pet location (FIRST IMPLEMENTATION)

**Problem:** existing separate local/shared playground features can visually or logically treat one pet as present in multiple places.

**Design contract:**
- Introduce a versioned **per-pet presence** record with mutually exclusive location kinds: HOME, LOCAL_PLAYGROUND, SHARED_PLAYGROUND, and VISIT; attach room/session references only where required. Separate **REST/SLEEP** as activity, not a conflicting physical location.
- For previously saved worlds with no presence record, safely infer HOME. Never rename existing pet IDs, rewrite authored names/journals, zero resources, or reset level/XP.
- Transitions: explicit send -> checked admission -> active -> return/finish; failed send must preserve prior presence. One active session per pet; return/cancel/expiry/restart must be idempotent.
- In offline local mode, local world state is authoritative. For shared presence, the server independently authorizes room/session membership and rewards; never trust client-reported XP or another player's pet snapshot as authoritative.
- Network outage on shared entry or exit: display PENDING/RECONNECTING safely, prevent duplicate admission/rewards, and reconcile with the server when back online. Do not silently teleport or clone a pet.
- Local player may inspect the habitat while the pet is away, but that pet is not rendered at home. The habitat and its plants/resources remain; other pets remain visible.
- Export/import and delayed saves must preserve the same state; a stale save must not resurrect a completed session.
- Availability for feeding, training, teleporting and visiting must check location and explain why an action is unavailable. Avoid destructive migration.

**Mandatory automated evidence:** old-save fixtures, new-save roundtrip, two pets in distinct places, repeated send, failed send rollback, restart mid-session, return exactly once, network loss/recovery, concurrent shared admission, no XP double grant. **Manual evidence:** Galaxy A55 and second Android device, airplane mode, backup/restoration, scene observation.

**Exit A:** all tests green, independent reviewer PASS, no P0/P1, explicit owner sign-off. Nothing from LW-B until that sign-off.

### LW-B — Separate screens, reduce scroll, suspend invisible rendering

- Home/Habitats is the only place where the complete home world canvas appears. Local/shared Playground displays its own canvas/scene, controls and compact status; no sticky duplicate aquarium.
- A pet currently away does not appear in the home scene. Show a compact presence card with destination and return/status.
- Use section navigation or collapsible panels rather than forcing long vertical scrolling; no loss of core settings, backup or accessibility controls.
- Pause render requestAnimationFrame/canvas and costly audio when tab off-screen, page hidden, WebView backgrounded or canvas outside viewport; resume cleanly, no runaway loops/duplicate timers. Use reduced-motion and lower-power fallbacks.
- Distinguish **simulation time** from **paint time**: hiding a canvas cannot stop legitimate bounded local simulation or reset a session. No need to render historical frames to catch up.
- Test portrait/landscape, insets, keyboard, scrolling, TalkBack/focus, and restore from background.

**Exit B:** no duplicate pet/world in any navigation path; no hidden 30/60-fps infinite loop; measurable baseline/performance comparison recorded; no layout regressions.

### LW-C — Autonomous local playground and bounded advancement

- Once admitted, the pet chooses among **already unlocked and eligible** toys. It may watch, approach, hesitate, imitate local rules, practice, rest or choose a different toy. The player unlocks facilities, chooses send/return and can **watch**, not micro-tap every action.
- Implement a **deterministic timestamp/seed-based session simulation** rather than background nonstop animation. Record session ID, start/end, seed, energy budget, toy choices/outcomes and a completion ledger. Reopening later calculates bounded elapsed work.
- **Duration design:** base session length + measured increments for playground tier and available equipment + individual pet level/proficiency/energy modifiers. Define precise formula and reasonable min/max in a separate balance ADR; do not pick arbitrary permanent values here.
- XP, skill increments and unlock eligibility must have per-session/day caps, diminishing returns and stable anti-repeat rules. No pay-to-win, no free XP from viewing animations, no acceleration from altering local clock without safeguards.
- Return summary includes actual elapsed eligible time, toys used, XP granted, per-skill progress (before/after), newly learned capability, energy impact and reason for early stop. A return during no connectivity remains safe for local sessions.
- Preserve current six-skill model and legacy solo progress; migration may expose old skills through the new system without silently granting more XP.

**Exit C:** 1/10/100 simulated sessions deterministic and reproducible; pause/restart/offline tests pass; XP/skills are capped; return summary matches ledger and cannot double-apply.

### LW-D — Visual and original audio polish

- Visible gameplay should feel smooth and appealing on representative mid-range Android hardware. Measure actual frame pacing, RAM, device heat and battery on Galaxy A55 plus an independent tester phone.
- Keep existing Canvas 2D unless a **measured** WebGL prototype improves perf/quality with a stable Canvas fallback; no forced graphics stack rewrite.
- Build a **curated library** of several original or properly licensed ambient tracks/short segments with seamless transitions, shuffle/rotation, and separate sound/music controls. Support mute, background suspension, audio focus, user consent where needed and offline assets or explicitly optional downloads.
- Desired creative direction: gentle, contemplative, spacious game ambience with memorable motifs. **Never copy Minecraft tracks, melodies or protected recordings.** Record authorship/license for every shipped asset, including generated assets.
- Keep APK size, storage and streaming under explicit budget; download is never required just to play offline.

**Exit D:** real-device 30+ minute smoke test, frame/battery/thermal observation, mute/focus tests, no audible looping click/glitch, content licenses recorded.

### LW-E — Inter-pet learning and friendship (POST-LAUNCH CANDIDATE)

- Social learning requires authenticated **consensual** shared time and genuine observable skill events. A pet can slowly progress toward a skill by watching a competent friend, attempting imitation and later practicing. Never instantly copy advanced skills.
- Track observation exposures and bounded affinity, independently for each pair; no public friends list, no compulsory messages, no uncontrolled stranger encounters.
- Pet-originated request is a *suggestion* to its owner. Sending an invitation, visit/room entry and disclosure require explicit human approval.
- Server enforces group membership, authorization, idempotent contribution and cooldown. Consent revocation/block/delete stops new exposures and cancels outstanding requests.
- Tests: two/three devices, betrayal/removed friendship, no-dup XP, replay/clock-skew, offline reconnect, spoofed skill and blocked user.

**Exit E:** independent safety review and verified two-phone social regression before enabling broadly.

### LW-F — Life rhythm, belongings, calendar, environment and earned-token economy (POST-LAUNCH)

Split into strictly sequential subgates **F1–F5**, not one giant commit:
- **F1 sleep:** multi-hour plausible rest windows per pet/age/energy, visible when awake; time-zone change/restart safe and no punitive real-life compulsion.
- **F2 home furnishings:** hygiene, desk, TV/console and decorative/learning items with clear gameplay purpose, small persisted footprint, safe performance and accessibility.
- **F3 real-world ambience:** day/night uses device local time without requesting location; seasons can use **optional, minimally precise** manual region choice. Actual weather/sunrise requires separate consent/data source, cache and offline fallback. No silent continuous GPS.
- **F4 birthday parties:** future date/time with explicit time zone, capped guest count, invitations/RSVP, verified friend access and safe cancellation/refund. Virtual earned-token party cost may scale with invited guests; payer, policy and exact formula must be approved before coding. No real-money purchase implied.
- **F5 earned-token shop:** exclusively in-game earned tokens initially, transparent cost and progression requirements, receipts/ledger, no paid shortcuts or hidden paywalls. If money is ever introduced later, new Play Billing/review scope and separate owner decision.

**Exit F:** each subgate has its own fixtures, two-device UI cases where applicable, save migration and explicit go/no-go.

## 5. Blocking release work — do not mistake a green build for store readiness

Before public Play release, independently close **every still-open** gate from [1.5.6 F Release Gate](V1.5.6_F_RELEASE_GATE.md) and [Acceptance](V1.5.6_F_ACCEPTANCE.md), especially:

1. Existing-world JSON export/restore rehearsal in a separate test install; stable signing and verified upgrade path.
2. Two real devices, same and different networks, privacy/authorization in friends, shared rooms, visitors and messages.
3. Backups including an actual PostgreSQL **restore** into a separate test database; record schema version, no secret leakage, never delete live volumes.
4. Trusted HTTPS, closed unintended public ports, server rate-limits and least privilege. No self-declared production readiness.
5. Real FCM opt-in/denial/rotation/mute/block/delete tests with generic lock-screen content. **If FCM fails, offline game must still work.**
6. Free-form chat must remain disabled for public/child-relevant beta until age-appropriate abuse/report/moderation review; simple link filters are insufficient.
7. English end-to-end translation review by tester, plus device language switching, contrast, text overflow, focus, reduced motion, TalkBack and RTL disclosure.
8. Google Play Console setup/identity checks, Play policies, accurate privacy/Data Safety, developer declaration, signing, internal/closed testing and final owner approval. Do not infer publishing eligibility from the fee.
9. Zero known P0/P1 regressions, documented P2 triage, reproducible install/upgrade smoke and human independent QA sign-off.

**Play Store scope discipline:** public release may ship LW-A–D plus the currently supported secure 1.5.6 features; LW-E/F are *not* prerequisites. A date cannot override a failed gate.

## 6. How we work — anti-loop and change control

**One phase only. No parallel feature development.** Every phase follows exactly:

1. **Baseline** — record branch and exact SHA of main, current app/API versions, pending release blockers; export verified test save and database backup where relevant.
2. **Mini-plan** — phase ID, exact files/modules to change, threat/data-migration impact, tests to add *before* implementation, exclusions, dependency check. No scope drift.
3. **Implement** — one isolated feature branch, small reviewed commits, preserve backwards compatibility; no edits to production server or current user device without operator-directed step.
4. **Verify** — unit + integration + JSDOM/UI + Android CI; independent reviewer and real-device QA as specified. Capture failures with reproducible evidence, not “looks okay”.
5. **Gate** — PASS only with commit SHA, named tests, screenshots/redacted logs and explicit owner approval. Else BLOCKED with exact remaining task list.
6. **Lock/advance** — update this roadmap's status/evidence pointer, merge only authorized validated changes, then start next phase.

**Single current task:** status is either TODO, IN_PROGRESS, BLOCKED, READY_FOR_QA, or ACCEPTED. “DONE” requires evidence; a partial result does not silently close a phase.

**No circular work:** a failed gate produces a concise issue record (ID, failed assertion, reproduction, fix owner, retest). Re-test only the affected checks plus phase regression; no repeatedly rewriting plans, renaming milestones, jumping ahead, or redoing passed tests without cause.

**Security guardrails:** No secrets in GitHub/chat/logs. Never docker compose down -v against the owner's server; no unapproved .env, firewall, port, Caddy, NAS or production data changes. Server migrations only after explicit backups and restore rehearsal.

**Separate test channels:** English tester branch, documentation branch, LW implementation branch and live server configuration must not be conflated. A GitHub green workflow is not an installed-phone or server migration PASS.

## 7. QA ownership and evidence template

**Owner:** product/UX decisions, live-server operator tasks, acceptance.  
**Implementer:** code, migrations, automated tests, no claims beyond evidence.  
**Independent tester:** US English UX/clarity, social visit, phone performance and written reproduction reports.  
**Reviewer/security gate:** challenge authorization, data loss, concurrency, accessibility and abuse surfaces independently.

For every phase, create its evidence file only when work begins: docs/evidence/LW-[phase]-[date].md, containing:
- Phase/branch/base SHA/final SHA/build artifact hash and tested APK signature.
- Requirement IDs and acceptance assertions, green workflows, test run outputs.
- Saved-world fixture version, backup verification result; DB restore result where applicable.
- Test phones/Android versions/network/offline scenario, frame/battery samples.
- Independent tester observations, defect IDs, risk decisions.
- Gate status and **explicit owner approval timestamp**.

**Defect priority:** P0=data loss, exposure, crash-loop, unauthorized shared changes; P1=core gameplay unusable, double rewards, broken return/reconnect; P2=major UX/performance defect; P3=minor polish. **No public release with P0/P1.**

## 8. Active phase ledger — LW-A only

**LW-00:** Owner accepted the direction and authorized starting LW-A on 2026-11-09. Planning remains in draft PR #17 pending merge.  
**LW-A branch:** `feature/trialum-lw-a-pet-presence-20261109`, [draft PR #18](https://github.com/extreme4music-nexus/Trialum/pull/18).  
**Contract and manual QA:** [LW-A Presence Contract](LW_A_PRESENCE_CONTRACT.md).  
**Phase status: IN_PROGRESS, NOT ACCEPTED.** LW-B/F are locked.

| Task ID | Work item | Current state | Gate |
|---|---|---|---|
| LW-00-DOC | Canonical 15-request roadmap | SOURCE DOCUMENTED; PR #17 draft | Main merge only after owner review |
| LW-A-01 | Exclusive per-pet state and transition contract | SOURCE IMPLEMENTED; design review pending | Old-save compatibility |
| LW-A-02 | Migration/idempotence/backup roundtrip tests | WRITTEN; CI on branch | Final SHA green + device restore |
| LW-A-03 | Presence engine, guards and network rollback | SOURCE IMPLEMENTED | Server-authoritative lease remains P1 |
| LW-A-04 | Local/shared view integration and visit reconciliation | SOURCE IMPLEMENTED | 2-device/offline/hardware QA |
| LW-A-05 | Server-atomic unique presence, revoke, return | **BLOCKED — NOT IMPLEMENTED** | Migration + independent race/security tests |
| LW-A-06 | Independent tester, backup/restore, owner acceptance | PENDING | **ACCEPTED A** required to unlock LW-B |
| LW-B…LW-F | Later milestones | LOCKED | Do not begin before phase A is accepted |

**Next active task:** close LW-A-05 and record evidence. No gameplay/version/build/production claim beyond what GitHub CI actually verifies. The real owner phone backup must be verified **before any test APK upgrade**; there have been no changes to the owner's existing installed game or live server.

## 9. Open design decisions — resolve only when the owning phase starts

| ADR | Decision question | Owning phase |
|---|---|---|
| ADR-01 | Presence schema/transition authority, shared reconnect and stale-session policy | LW-A |
| ADR-02 | View hierarchy, offscreen detection and reduced-motion strategy | LW-B |
| ADR-03 | Deterministic simulation, session duration formula, anti-farming and XP caps | LW-C |
| ADR-04 | Asset format, audio licenses, offline size budget and optional WebGL metrics | LW-D |
| ADR-05 | Skill imitation pace, relationship decay, privacy and consent | LW-E |
| ADR-06 | Sleep simulation, optional location granularity, party costs and earned-token pricing | LW-F |

Open ADRs are **not permission** to block already agreed earlier phases; they become required input just before implementation of their respective phase.

## 10. Change log

- **2026-11-09 / LW-00:** accepted 15 tester proposals; established phase order, first-public-release scope, release blockers, evidence rules and anti-loop procedure. Documentation only. No source, database, API, APK, production infrastructure or gameplay was changed.

- **2026-11-09 / LW-A started:** owner authorized execution; client-side exclusive pet presence and tests committed to isolated branch, draft PR #18. **Server-authoritative per-pet lease is still missing**; public release and LW-B remain BLOCKED.
