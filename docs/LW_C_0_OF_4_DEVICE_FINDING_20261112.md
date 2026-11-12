> **SUPERSEDED by owner directive 12 Nov 2026:** Waiting 6–22 minutes for the first local interaction was rejected. The **current implementation** is [LW-C real-time autonomy v2](LW_C_REALTIME_AUTONOMY_20261112.md): first action at +4s, 12s continuous interactions, capped XP independent of play duration, immediate live shared-room pet dialogue. Remaining text below is an archived version-1 decision and must **not** be used as an active acceptance criterion.

# LW-C device observation — 0/4 after five minutes (12 November 2026)

**Owner finding:** All three owner-signed v30 (1.6-LW-dev.7) apps report "самостојна игра", but the counter remains 0/4 and +0 XP after at least five minutes in local and shared playgrounds. Treat this as a **real clarity and perceived-activity defect**, not proof of Android background failure.

## Confirmed root cause in source

1. Local autonomous simulation (`js/playground.js`) schedules 4 durable, deterministic ledger events at 20%, 40%, 60% and 80% of a 30–110 minute session. The **first counter increment therefore happens after 6–22 minutes**, and the minimum under normal full-energy conditions is often longer than six minutes. Some events are rest/observation and legitimately award 0 XP. Five minutes of 0/4 is expected and the app previously did not explain this.
2. Shared playground (`js/shared-playground.js`) does **not** run LW-C local autonomy. Shared points are server-authoritative, earned only after a confirmed button-triggered group activity (up to six/day), not after passive elapsed time. The LW-C roadmap expressly covers the **autonomous local** playground; enabling server-granted autonomous shared rewards without a separate consent/security design would misrepresent the existing system.
3. The initial local spectator canvas looked static until a durable checkpoint; the user reasonably expected to **see** an autonomous pet soon after admission. The app also showed no "next checkpoint" estimate.

## v31 internal QA corrective action (PR scoped to LW-C)

- **Immediate visual-only choices**: a pet in a valid local session changes among admitted/unlocked toys and rest/observe/explore/hesitate motion roughly every 15 seconds. Deterministic from saved session seed and elapsed time; no event/XP/energy changes on rendering, scrolling, replay or watch.
- **Explicit next checkpoint**: shows approximately how many minutes until the first/next recorded activity. Refreshes on the existing visible-app 20-second tick without starting new background timers. Retains 30–110-minute duration and four bounded ledger checkpoints (no unapproved economy rebalance).
- **Honest shared-playground disclosure**: confirmed group actions from the existing buttons grant group points; autonomous local XP is not carried over to a shared server room. No server or FCM changes.
- Update English catalog and synchronized key baseline, PWA offline cache and versionCode to **31 / 1.6-LW-dev.8** for the original three owner-signing identities. Preserve existing world data, backups, accepted messaging and signed certificates.

## Regression/acceptance

- At +5 minutes: **0/4 and 0 XP is allowed**, but a clear next-checkpoint timer and changing spectator scenes must appear.
- At first actual checkpoint: ledger count advances exactly once, regardless of whether XP is earned. At most 4 recorded events/session and max 4 combined manual/autonomous rewarded practices per pet/day. Repeat reconciliation, restore, background, modified clock and watching cannot repeat XP.
- Shared actions remain authenticated/server-confirmed; no local faked shared score.
- Automated UI, exact locale, social/server and three Android candidates must pass before protected main owner-signed v31 artifact publication.
- Owner physical acceptance and future private shared autonomy are **separate** decisions; do not claim either has passed, and do not start LW-D.

**Relevant source:** [LW-C ADR-03](LW_C_ADR03_AUTONOMY_20261112.md) and [LW roadmap](TRIALUM_LIVING_WORLD_ROADMAP_2026.md).
