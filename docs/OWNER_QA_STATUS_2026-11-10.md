# TRIALUM — Owner-confirmed QA status (10 November 2026)

**Authority:** direct owner reports in conversation on 10 Nov 2026. **Scope:** status clarification only; no code changes, CI run, server operation, or independent audit. This document supersedes older *status descriptions* where they conflict, but does not waive release/security gates or assert unobserved test results.

## Status vocabulary
- **OWNER PASS:** owner personally confirms functional test; not an independent audit.
- **PARTIAL:** implemented/visible in part; remaining work specified.
- **PENDING:** owner has not yet reported the planned verification.
- **DEFERRED:** deliberately postponed, not a failed test.
- **RELEASE HOLD:** publication/beta deliberately postponed; not equivalent to server failure.

## 1.5.5
| Area | Owner status | Remaining work / boundary |
|---|---|---|
| Small local LLM (SmolLM2) | **OWNER PASS** — physically tested and works | No longer list its basic operation as untested |
| Qwen 0.5B | **OWNER PASS** — physically tested and works | Do not conflate functional operation with independent performance certification |
| Qwen 1.5B | **OWNER PASS** — physically tested and works | Same distinction |
| Learned skills | **PARTIAL** — learned skills are shown | Broader emotion/personality/visual behavior development was moved into LW; do not block 1.5.5 on that deferred scope |
| Emotion rendering | **DEFERRED to LW** — no emotion display currently | Design and implement in the later LW roadmap; exact LW subphase not yet confirmed |
| System/light/dark theme | **INCOMPLETE** | Finish and physically verify theme behavior |
| English localization | **INCOMPLETE / CONTINUOUS** | Finish complete English translation and maintain it as content changes |
| Other languages | **DEFERRED / CONTINUOUS** | Keep existing partial catalogs honestly labeled; full translation and review after official launch |

**1.5.5 conclusion:** Three local LLM tiers are owner-tested and working. Do not label 1.5.5 formally closed: theme and complete English localization remain. The full emotion implementation and full non-English translation are explicitly out of this version's immediate completion gate. Earlier documentation may describe coded emotion states; this is NOT proof of visible emotion UI.

## 1.5.6
- **OWNER PASS — server functional:** owner explicitly confirms the server is fully functional.
- **RELEASE HOLD:** production rollout and beta testing are deliberately postponed. Do not describe the pause as a server failure.
- **NOT a final public release:** this functional server confirmation does not automatically certify Firebase, Play Console, independent security/privacy review, all two-device gates, or formal production sign-off. Older release-gate tables are historical snapshots and must not override the newer owner confirmation about server functionality.
- Do not imply the server was stopped for a defect or that all separate production audit gates are complete.

## LW-A
| Check | Status |
|---|---|
| Duplicate pet presence prevented in Android app | **OWNER PASS** |
| Duplicate pet presence prevented on server | **OWNER PASS** |
| Session expiration | **PENDING** — owner plans physical check |
| Correct return of pet home | **PENDING** — owner plans physical check |
| Recovery after internet/network interruption | **PENDING** — owner plans physical check |

Owner intends to verify the three pending behaviors together. **LW-A not formally closed until these are confirmed.** A two-user shared-playground functional test had previously been reported as passing; this does not substitute for the three pending cases.

## LW-B
**Planned next:** separation of home scene and shared-playground scene, including presence/state isolation and correct rendering without duplicate visual entities. Broader emotions/personality are assigned to the LW program, **not yet explicitly assigned to LW-B**. Do not invent additional LW-B acceptance criteria or mark it started/closed without a signed-off phase plan.

## Execution policy / next action
- **No implementation work authorized by this status update.**
- Await owner's LW-A physical results for session expiration, return-home and network recovery.
- Keep version completion, owner functional PASS, automated CI PASS, and public production authorization as separate concepts.
- Play Console registration and public beta are deferred until the owner's chosen time/budget; no forced deadline.
