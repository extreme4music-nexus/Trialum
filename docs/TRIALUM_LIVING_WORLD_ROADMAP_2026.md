> **NEW OWNER VISION / D0 FOUNDATION — 14 NOV 2026:** The owner has explicitly expanded Trialum into **„Триалум – Жив Свет“ / “Trialum – Living World”**: full landscape scene-first UI, animated laboratories/biomes/flora/research, offline simulation independent of visible 3D renderer, optional *foreground-only* AI, meaningful biology education, emergent fictional DNA creations, earned nonessential tokens, autonomous pet identity/memory, opt-in notifications, non-compulsive play, gifting/expiring loans, child safety and later Google Play Games. **Google Developer account already exists**; Play Console verification is separate. Read [full detailed vision](TRIALUM_LIVING_WORLD_VISION_20261114.md), [D0–D8 delivery plan](LW_D_DELIVERY_PLAN_20261114.md) and [architecture map](LW_D_ARCHITECTURE_MAP_20261114.md). The owner authorizes an **isolated D0 prototype and documentation now**, without altering current main gameplay, Android signing, persistent worlds, servers or production. Older LW-C owner gates remain for merging/releasing new runtime behavior; do not reinterpret this prototype as LW-C closure or LW-D acceptance.

> **CURRENT VERIFIED PRIVATE DEVELOPMENT STATUS — 12 NOV 2026 (SUPERCEDES OLDER 10/11-NOV TASK STATE BELOW):** LW-A core owner acceptance includes safe local/shared presence and offline return; LW-B is **OWNER PASS / ACCEPTED_PRIVATE_OWNER_QA** on all four physically tested signed `1.6-LW-dev.6` v29 Android criteria. See [LW-B exact-source/signed evidence and owner statement](LW_B_SCENE_ISOLATION_20261112.md), source SHA `71cbb8a94e31c79c68ea3d2119f4de5a07e2179b`. **NEXT AND ONLY ACTIVE PHASE: LW-C — IN_PROGRESS** on [PR #41](https://github.com/extreme4music-nexus/Trialum/pull/41), with [ADR-03](LW_C_ADR03_AUTONOMY_20261112.md): deterministic local-playground sessions, earned-time/skill caps and replay-safe summary. No LW-D, LW-E or LW-F implementation starts until LW-C gate and explicit owner device acceptance. The dated historical roadmap/task-ledger text below is an archival decision record, **not a license to reopen already owner-passed Firebase, signing, LW-A or LW-B work**. Independent store/secondary-device/performance and Play policy gates remain separate from private acceptance; no public release is authorized.

> **CURRENT LW-A IMPLEMENTATION UPDATE — 11 NOV 2026:** Owner confirms previously required signing/SignQA step already complete and requests no more repetition. Remaining session lifecycle code is on `feature/trialum-1.6-lw-a-session-lifecycle-20261111`: local two-hour offline expiry with restore/resume reconciliation, independent renewal of each authorized shared pet near expiry, and server expiry/replay/no-XP regression coverage. **Not yet ACCEPTED** until CI, independent reviewer and explicit owner sign-off. Stop at LW-A, no LW-B or public release. Earlier roadmapping paragraphs are historical.

# TRIALUM 1.6-LW — Living World Roadmap (2026–2027)

**Status (owner revision 10 Nov 2026):** **ACTIVE NEW DEVELOPMENT LINE: 1.6-LW**, separated permanently from the closed 1.5.5/1.5.6 milestones. **1.6-LW-A source is merged into main but NOT ACCEPTED** (session lifecycle/expiry missing); 1.6-LW-B–F remain planned, strictly sequential. Historical status paragraphs below are retained as the earlier decision record. [Version-line baseline](TRIALUM_1.6_LW_BASELINE.md).  
**Decision dates:** 2026-11-09 (15 tester proposals); 2026-11-10 (owner QA and priority change). **Historical baseline:** main at d972c17f569dc3b13029cf8fa7f31119fa33f5a6 (not current).  
**Owner:** project owner. **Independent QA:** invited external musician / US English tester.  
**Canonical index:** [PROJECT_ROADMAP.md](../PROJECT_ROADMAP.md). Existing 1.5.6 security/release gate remains authoritative for unresolved public-release risks: [1.5.6 F gate](V1.5.6_F_RELEASE_GATE.md).

> **Македонско резиме:** Целта е миленичето да има сопствен живот, место, време, интереси и пријателства. Играчот создава услови, отклучува можности и се грижи; миленичето самостојно живее. Развојот оди строго по фази со тестови и докази. Ниту еден нов систем не смее да ги избрише постоечките светови или да го расипе офлајн играњето. Овој документ е план, не имплементација и не одобрување за Play Store.

## New version-line directive: 1.6-LW

The owner has **closed 1.5.5 and 1.5.6 development**, and all further Living World design, implementation, testing and documentation belong to **1.6-LW**. Codes `LW-A` through `LW-F` and tester T01–T15 remain the same, but their release/milestone identity is now `1.6-LW-A` through `1.6-LW-F`. The recovered LW-A non-overwriting backup and presence sources are already in `main` from PR #21. Next implementation is the unimplemented session lifecycle/expiry in LW-A. The separate development branch is `feature/trialum-1.6-lw`, not a continuation of any 1.5.x feature branch. No Google Play/public release is authorized merely by this version transition. Consult [the canonical new-series baseline](TRIALUM_1.6_LW_BASELINE.md).

## 0. Product north star and scope

**“You create the world. Life in it grows on its own.”** A durable, age-appropriate, offline-first life simulation intended to be enjoyable across generations (roughly ages 6–66 and beyond). The player is a guardian and creator, not a button operator commanding every animation.

This roadmap records **all 15 accepted tester requests**, provides a single implementation order, explicitly separates **first-public-release candidates** from **later expansions**, and defines verifiable phase exits. Additional tester ideas go into a backlog without silently changing active-phase scope.

**One source of truth:** this document owns the new Living World initiative (LW). The root roadmap links here. [Owner-confirmed QA corrections](OWNER_QA_STATUS_2026-11-10.md) govern current observed results. Existing 1.5.5 and 1.5.6 release, privacy and migration docs continue to govern their own gates; never copy contradictory status claims into new files.

**Never claim a date as a release guarantee.** The owner's expected Play Console budget window is approximately one week after 2026-11-09; account setup, verification, testing eligibility and independent QA may take longer. A paid developer account is not proof of publishing eligibility or game readiness. Do not skip quality gates to meet the date.

## Historical priority decision — 10 November 2026 (since superseded by 1.6-LW version-line transition)

**Do NOT resume Living World implementation yet.** The owner explicitly requires this order:
1. Commit and reconcile this entire LW roadmap in the canonical GitHub `main` documentation, preserving all 15 tester items (T01–T15) and the previous 1.5.6-A–F history. New owner suggestions are tracked separately; they do not silently rewrite the original 15.
2. **Finish 1.5.5**: the three real local LLM tiers (SmolLM2, Qwen 0.5B, Qwen 1.5B) are **OWNER PASS**, not unresolved. The missing concrete work is **complete English localization and proper System/Light/Dark theme functionality** with real-device verification. Learned skills are displayed but broader visible emotions and creature personality are **deferred to LW**. Other 15 language packs remain honestly partial and are only revisited at milestone boundaries **after LW completion**, per the latest owner decision.
3. **1.5.6-B–F owner accepted as-is on 10 Nov:** friends, skills, shared playground, messages and F release-feature scope are closed **for current functionality**. Do not invent extra feature blockers. Independent Android/two-device, FCM, privacy/security/accessibility, safe backup/restore and Google Play publication gates still belong to **future public-release assurance**, not to current B–F feature-scope acceptance. The owner has postponed Play Console registration, beta and publication. See [owner scope decision](OWNER_SCOPE_DECISIONS_2026-11-10.md).
4. After resolving **155-04 theme** and **155-05 missing English**, with 1.5.6 feature scope already owner accepted, revisit **LW-A**, first closing the missing session lifecycle before any LW-B. The owner has reserved a separate **serious conversation about the long-term future of Trialum** for after those version closures. Do not infer or preempt its decisions.

**LW-A owner evidence (2026-11-10):** duplicate-pet prevention **OWNER PASS both Android and server**; safe return home from shared playground **OWNER PASS**; reconnection after internet outage **OWNER PASS**. **Session handling/expiry is NOT IMPLEMENTED**, not a failed session test. LW-A remains open. See [owner QA ledger](OWNER_QA_STATUS_2026-11-10.md). No change to production, GitHub game code or real server is authorized by the documentation entry alone.

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
| **LW-00** | Canonical roadmap, baseline hash, release blockers, QA evidence format | Existing main | Canonical roadmap on main; later phases paused pending 1.5.5/1.5.6 closure |
| **LW-A** | Single pet presence + safe saved-state migration + missing session lifecycle | LW-00 **and closed 1.5.5/1.5.6** | Partial owner PASS; session design/expiry not implemented; NOT ACCEPTED |
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

## 8. Current task ledger — LW implementation paused until both version gates close

| Task ID | Work item | Current state | Gate |
|---|---|---|---|
| LW-00-DOC | Record user/tester decisions and canonical roadmap | **DOCUMENTED on main (2026-11-10)** | Keep index and status aligned |
| LW-A-01 | Presence schema, migration semantics and transition contract | **PARTIAL — owner functional PASS for duplicate presence; source/evidence audit still needed** | Review and missing session lifecycle |
| LW-A-02 | Old-save/new-save fixtures and idempotency/concurrency tests | **UNVERIFIED** | Locate existing test evidence, add missing cases only |
| LW-A-03 | Presence engine and local/remote reconciliation | **PARTIAL — owner functional PASS for reconnect** | Automated/independent evidence still required |
| LW-A-04 | Home/local/shared scene integration and return handling | **PARTIAL — safe return OWNER PASS** | Verify scene isolation at LW-B gate |
| LW-A-05 | Implement session lifecycle/expiry and tests; independent reviewer/owner signoff | **BLOCKED: sessions not implemented** | **ACCEPTED A** required to unlock LW-B |
| LW-B…LW-F | Per-phase mini-plan/task subdivision | FUTURE | Only when prior gate accepted |

**Next authorized implementation activity:** finish 155-04/155-05 first; 1.5.6-B–F current feature scope is owner accepted. After separate owner acceptance of those versions, audit LW-A code and implement its missing session lifecycle/expiry with save safety, idempotency and acceptance tests. Do not touch production without explicit operator authorization.

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


## 11. New owner decisions — tracked separately from the original 15

### N16 — Spontaneous pet-to-pet exchanges using the small local LLM (candidate LW-E; not implemented)

When two consented friends' pets are together either **in one friend's habitat** or **in the shared playground**, allow occasional pet-initiated dialogues using the **small on-device LLM** as a creative layer. Conversations should arise *sporadically* (natural, seeded cooldowns, long silences and context), not as constant requests or forced chat. A pet may initiate a question, the other may respond, and they can stop or drift to other play. Keep personalities distinct; preserve quirky emergent creativity without labeling model output as real emotion or sentience.

Design gate: both owners consent to social presence and AI/dialogue; age-appropriate content filtering, off switch, bounded input/output and memory, cost/battery/network caps, never leak player names, prompts, histories or private metadata to peers; no untrusted remote output becomes game commands. Offline/absent model falls back silently to lightweight scripted behaviors. Define exactly **which device runs the inference** and exchange only minimum authorized events before implementation. Never imply multiplayer LLM dialogues already work.

### N17 — Consent-preserving LLM rehydration after restore (future enhancement; legacy local Backup/Restore is already owner PASS)

The player should not be forced to manually locate and download a previously unlocked, consented local model after reinstall/backup restore. Backup may preserve model **identity, unlocked entitlement and prior explicit download preference**, **not multi-gigabyte model files or credentials**. After restore and suitability checks (device storage, RAM, network/data policy, verified HTTPS/checksums, parental controls where relevant), re-download **automatically only when previous consent expressly covers restores**; otherwise show one clear opt-in choice. Respect disabled models, no background surprise downloads, progress/cancel/retry, resume and integrity checks. Do not promise that Android uninstall can retain app-private model data; uninstall retention depends on OS-managed storage and cannot be overridden by an in-app prompt. Test fresh install, different device, no Wi-Fi, insufficient storage, cancellation, corrupt download, backup legacy format and no data loss.

### Long-term design principle (not a release commitment)

Trialum aims at an intergenerational *parallel digital world* of original creatures with distinct identities, cultures, relationships, memories and histories; attachment should arise from curiosity and care, **not compulsion, punitive timers, social pressure, advertisements or behavioral manipulation**. Creative personality and safety policy are separate layers. Any detailed future-world decisions remain reserved for the owner's later discussion, **after 1.5.5 and 1.5.6 are settled**.

## 12. Documentation update record

- **2026-11-10:** merged the prior LW documentation direction into main, retained T01–T15 intact, aligned LW-A owner-reported PASS and the **missing, unimplemented session lifecycle**, recorded N16/N17, and reprioritized 1.5.5 → 1.5.6 → LW. This entry reports documentation state only and does not claim code completion or fresh CI.
