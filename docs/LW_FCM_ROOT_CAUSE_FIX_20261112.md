# Trialum LW — message notifications root-cause investigation (12 Nov 2026)

## Owner observations (device evidence)
- The three owner-signed Android apps display **local pet-care notifications** (hunger, hygiene, play) via `CareWorker.kt`.
- Authenticated messages travel to the private server and appear in the game inbox (**OWNER PASS**).
- Android system notifications for **received messages** are still absent (**OWNER FAIL**).
- These are separate paths; pet-care notification success **is not proof of remote FCM delivery**.

## Confirmed source/configuration defect
The APKs have distinct Android package IDs:
- Release: `com.trialum.ziivaiskra`
- Signing QA: `com.trialum.ziivaiskra.signqa`
- Friends Debug: `com.trialum.ziivaiskra.signdebug`

The previous Gradle build allowed the QA and Debug apps to **inherit the Release Firebase Android App ID**. GitHub CI emitted an explicit warning that QA/Friends Debug used a fallback App ID but still signed all APKs. Firebase must associate a valid Firebase app with each actual Android application/package. **This is a concrete incorrect build identity and must be fixed**, but the full observed runtime failure cannot be assigned to it alone without a physical Firebase test.

## Source repair in PR #36
- Fail closed if Release/SignQA/Friends Debug App IDs are missing, repeated, wrong-format or have the wrong sender ID when FCM is configured. Unsigned PR smoke builds may disable FCM when public console variables are incomplete; **main owner signing refuses to publish deceptively FCM-ready APKs**.
- Send **generic, no-private-data notification+data** from `server/src/push.mjs` so Android displays an OS notice in background, with existing native FCM callback for foreground. The notification contains no sender, message text or pet data, only generic Trialum text and a random reference UUID.
- Create the separate `trialum_friends_optin` Android notification channel on consent; reveal when the user has blocked that channel. Local care channel is `trialum-care-v14` and may remain enabled independently.
- Existing, opted-in players attempt a bounded FCM token re-registration after app restart/upgrades; no unconsented background Firebase initialization or token exposure.
- Build `versionCode=27`, `versionName=1.6-LW-dev.4`. Use **the same permanent Release/QA signing identities**; don't uninstall existing v26 apps, clear data or regenerate keys.

## Firebase console/Actions values (not confidential)
1. In the already-owned Firebase project add/check the **three Android app registrations** with their exact package names above.
2. Verify each corresponding Firebase Android App ID has shape `1:<sender-number>:android:<hex>`; **the values must be distinct but share the sender number/project**.
3. In private GitHub repo **Settings → Secrets and variables → Actions → Variables**, set `TRIALUM_FIREBASE_APP_ID`, `TRIALUM_FIREBASE_APP_ID_SIGNQA`, `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG`, `TRIALUM_FIREBASE_SENDER_ID`, `TRIALUM_FIREBASE_PROJECT_ID`, and `TRIALUM_FIREBASE_API_KEY`. These are public client identifiers, NOT service-account JSON. Never upload private keystores or FCM tokens into issues, chat, logs or source.
4. Re-run the protected signed **main** workflow only after tests and user approval; confirm all three v27 provenance files, source SHA, expected package, versionCode, sha256, pinned owner signer and embedded per-package Firebase App ID.
5. Test the friend-notification channel in Android Settings for each app. Within Messages opt in explicitly, grant runtime permission and check the device's push registration/availability UI. Send to a second opted-in friend with the app in foreground and again with screen locked. Keep message body private. Test opt-out, block, mute, and account delete negative cases.
6. For failed device tests inspect only **privacy-safe server categories** `trialum_fcm_auth_*`, `trialum_fcm_http_<status>`, `trialum_fcm_transport_unavailable`; avoid credentials or token dumps. Server change cannot be verified until controlled deployment to Debian.

## Do-not-touch contracts
- Do **not** restart Docker, alter Caddy, router WireGuard, Samba/NAS mounts, port forwards, PostgreSQL volume or user files as part of GitHub-only fixes.
- No automatic Play Store release. Preserve all historical builds, user progress, social privacy, app installation identity and consent boundaries.
- **Do not mark FCM OWNER PASS** before a real Android notification appears; CI/build PASS alone is not the result.
