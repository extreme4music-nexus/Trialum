# Trialum 1.6-LW-A — owner QA response, offline-presence and FCM investigation

**Reported:** 11 November 2026 in owner comments on [#32](https://github.com/extreme4music-nexus/Trialum/issues/32) and [#33](https://github.com/extreme4music-nexus/Trialum/issues/33).  
**Status:** Source candidate under independent CI and owner-device retest; **NOT** accepted or a live-server deployment.

## Owner clarification — 12 November 2026 (post-LW push priority)

- Physical observation: all three installed Android Trialum applications display pet hunger/hygiene care notifications. Message-triggered notifications are still absent. **Local-care alert delivery is not proof of FCM remote-message delivery**; do not call remote FCM PASS.
- Owner explicitly **defers message-notification debugging until the end of LW-A–F**. Track in [#33](https://github.com/extreme4music-nexus/Trialum/issues/33) as post-LW debugging, not a reason by itself to block the next phase.
- Do not prematurely mark LW-A complete: the offline disappearance/remote-presence regression [#32](https://github.com/extreme4music-nexus/Trialum/issues/32) still needs owner-device retest, independent review and explicit acceptance. [PR #35](https://github.com/extreme4music-nexus/Trialum/pull/35) remains a draft source candidate; passing CI is not owner phone acceptance.
- Preserve all three permanent APK signing identities, local worlds, opt-in/mute/block consent controls and private backend. No APK release or live Debian modifications by this documentation update.

## #32: Owner's clarification and conservative client fix

- User A loses Internet; all pets stop displaying on A, while A's shared pet vanishes on connected friends' devices. On reconnect, the pet comes back to the room unchanged. Owner permits a temporarily missing shared sprite **provided a clear explanatory notification** appears, and requests the ability to return A's pet home offline followed by server sync.
- A failed room snapshot used to **clear the selected room and last successful snapshot**, which can blank A's screen. Source now retains the last authenticated snapshot on **transient network failure only** and marks it as **unverified**, disabling live actions. Explicit 403/404 revocation still clears the room.
- When a previously confirmed occupant disappears from a newly authenticated snapshot, display a short neutral notice: connectivity, intentional return and lease expiration are possible. **Do not claim the friend is definitely offline; the server has no authenticated connectivity proof.** No global online tracking is introduced.
- Offline Return enqueues a **persisted intent** bound to the exact pet ID, room and session. It does **not** move the pet HOME, invent new authorization, award XP or release a real lease offline. After authenticated reconnect (including Home foreground), a matching lease is returned through the normal idempotent server endpoint; a subsequent GET confirms absence before normal reconciliation moves the pet home. This protects the one-location invariant.
- Regression tests exercise stale snapshot retention, offline return queue, reconnect, precise lease ID and unchanged XP. Independent CI and a fresh phone run still required. This change does not prove or modify server WebSocket disconnect logic.

## #33: Explicitly separate permission, registration and delivery

- Owner says **Android permission dialog works**; in-app messages work; Android notification never appears.
- FCM server dispatch already depends on consent, accepted friendship and absence of block/mute. This source candidate requests HIGH priority for sparse, user-visible generic data notifications and adds **only coarse diagnostic codes** to server logs (auth missing, network, HTTP status). No token, device ID, message text or recipient is logged.
- The Release, Signing QA, and Friends Debug APK packages have **different Android package names**. CI now supports separate Firebase Android App IDs for `com.trialum.ziivaiskra.signqa` and `com.trialum.ziivaiskra.signdebug` in optional GitHub Actions variables `TRIALUM_FIREBASE_APP_ID_SIGNQA` and `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG`, forwarding them into Gradle and verifying native compiled resources. Absence produces a warning; it does not silently fabricate a Firebase project/registration. Release retains `TRIALUM_FIREBASE_APP_ID`.
- **Operator-owned configuration still necessary**: register those package IDs in the same Firebase project, verify per-app IDs/sender ID/API key match the actual project, validate Android notification permission and opt-in, verify the authorized `GET /v1/messages/push` responds `{registered:true,available:true}`, then verify the server's `TRIALUM_PUSH_ENABLED=true`, FCM project ID, and mounted **private** service credentials under `/run/secrets/` without disclosing them. Private credentials never belong in GitHub source or APK.
- Signed candidate does **not** imply FCM delivery succeeded; that requires real device test with the app backgrounded / screen locked and a true friend message. Verify opt-out/mute/block negative tests.
- If delivery still fails, inspect only the new `trialum_fcm_*` error classes in Debian container logs, not raw payloads or tokens. Treat 400/401/403/404 FCM statuses by their appropriate configuration cause; never paste keys in an issue.

## Gates and order

1. CI review on branch and no accepted-feature regressions.
2. Owner-signed QA APK built using existing immutable signer identities and owner-managed Firebase config, never PR debug/temporary signer.
3. Owner physical #32/#33 retest; **open until PASS**.
4. Owner-controlled Debian security hardening, backup/restore drill, Caddy TLS, firewall/WireGuard, Docker/PostgreSQL isolation and secret handling.
5. Explicit owner LW-A acceptance; owner has another request before LW-B.

**No Play Store release, no deletion/reset, no production database migration, no signer rotation, no unreviewed live Debian changes.**
