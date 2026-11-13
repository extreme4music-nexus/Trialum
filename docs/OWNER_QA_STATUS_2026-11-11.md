# Trialum 1.6-LW-A — owner physical QA update (11 November 2026)

**Source:** owner direct real-device testing report in conversation, 11 November 2026.  
**Scope:** update the acceptance ledger only. This is **NOT** a claim of independent certification, server security completion, final APK release, or a permission to start LW-B. The historical 10-Nov QA record stays unchanged.

## Owner-confirmed PASS

| Check | Result | Detail |
|---|---|---|
| Private messaging | **OWNER PASS** | Send and receive both work |
| Shared playground | **OWNER PASS** | Tested with three friends on real installations |
| Independent multi-pet presence/return | **OWNER PASS** | Two pets entered shared playground; one returned home, the other remained; no duplicate |
| Force-close and reopen | **OWNER PASS** | Away pet was still in the correct place |
| Session time limit / lease renewal / safe expiry | **OWNER PASS** | Owner reports session expiry, shared renewal and safe return without XP loss |
| Friend visit | **OWNER PASS** | Acceptance, refusal and safe return; no duplicate/lost progress reported |
| Network recovery after returning online | **OWNER PASS (with defect)** | States return normally after reconnection, but see issue #32 |

## Open regressions — LW-A NOT formally closed

| Check | Result | Tracking |
|---|---|---|
| Push notifications | **OWNER FAIL** | [#33](https://github.com/extreme4music-nexus/Trialum/issues/33): notifications no longer arrive; previously worked in older builds. In-app messages still work. Do not falsely claim FCM provider or native delivery verified. |
| Network-disconnect presence visibility | **OWNER FAIL / PARTIAL recovery** | [#32](https://github.com/extreme4music-nexus/Trialum/issues/32): when only A loses Internet, all pets disappear from A's own app, and A's pet also disappears on the screens of B/C/D who remain online; after A reconnects, pets return. |

**Technical caution:** a live shared-room view depends on authenticated server lease validity, not raw WebSocket socket liveness. Do not extend expired presence unboundedly or blindly replace server truth with cached pet data. No root cause has been established; test short interruption vs true 2h expiration and explicit block/leave.

## Exit order

1. Investigate, fix and regress-test #32 and #33 on a separate source branch/PR; preserve all previously accepted 1.5.5/1.5.6 and LW-A behavior.
2. CI / independent review, then owner installs only the correctly signed owner-controlled QA APK and rechecks the failed cases.
3. Owner-controlled Debian security hardening: backup and restore verification, firewall/WireGuard, Caddy TLS, Docker/PostgreSQL isolation, secrets and access; do not improvise live changes or reset data.
4. Explicit owner LW-A closure decision. Then owner has one further request before starting LW-B. Public release remains ON HOLD.

**Nonchanges:** This ledger introduces no app/server code, migrations, key changes, installation, data resets, secret exposure or public Play release.
