# Trialum LW-D FCM recovery & automatic GitHub QA signing (2026-11-14)

**Status:** Existing Firebase SignQA App ID wired; original GitHub QA signing Secret flow restored to LW-D. Actual remote FCM delivery on owner's Android phone is still **OWNER QA PENDING**. All edits isolated to Draft PR #58; no main, Codex, Play Console, Debian, or world data changes.

## Existing three-application ownership contract

- Official Android Release `com.trialum.ziivaiskra`: Codex / beta / Play Console.
- Friends Debug `com.trialum.ziivaiskra.signdebug`: Codex.
- Signing QA `com.trialum.ziivaiskra.signqa`: dedicated LW-D owner QA build.

**No fourth Firebase application**, no new Firebase ID, no new signing keystore. All three Firebase app registrations and their Actions Variables are already in place.

## Real root cause, previous successful implementation

The existing FCM SDK and consent-based messaging are in `TrialumPush.kt`, `TrialumFirebaseService.kt` and `TrialumApplication.kt`, dating back to LW-A fixes PR #36/#38. Server dispatch uses a generic notification in channel `trialum_friends_optin` and requires opt-in. Local notification self-test does **not** prove a remote FCM message.

LW-D's earlier workflow built the separate `.lwd1` debug package and forwarded only the HTTPS Friends endpoint. That package was not one of the three registered Firebase applications and its APK was therefore missing the proper package-matched Firebase App ID. The earlier LW-D fix incorrectly requested a fourth Firebase app and later introduced an unnecessary local-signing process. Both were owner-rejected and removed.

The original GitHub signing contract has always been established in `.github/workflows/android-signing.yml`:
- `secrets.TRIALUM_QA_KEYSTORE_B64`
- `secrets.TRIALUM_QA_STORE_PASS`
- `secrets.TRIALUM_QA_KEY_PASS`
- `vars.TRIALUM_QA_CERT_SHA256`
- Existing permanent signing alias `trialum-qa`.

The original shared signing workflow remains unchanged; it signs on trusted main and would also build Release/FriendsDebug, so LW-D has its **own scoped, trusted SignQA-only signing job** using the same existing QA signing credentials and certificate pin.

## Implemented solely in LW-D's Draft PR #58

1. LW-D isolated build now uses `:app:assembleSignqa`, package `com.trialum.ziivaiskra.signqa`, with `TRIALUM_FIREBASE_APP_ID_SIGNQA`, the existing sender/project/API key and `TRIALUM_SOCIAL_API_URL`. The compiled APK resources are checked before signing.
2. Android LW-D immersive 3D behavior is allowed for `.signqa` (and historical `.lwd1` preview), not official Release or FriendsDebug.
3. Existing LW-C AI/dialogue bridge, L3.1 lab scenes and original save/social data remain bundled. Regressions cover all preserved components.
4. The source/Android QA job uploads an intermediate unsigned APK. A **separate automatic signing job** depends on its successful tests and package/resource verification.
5. Signing runs only on **owner push** to `fix/lw-d-fcm-lwd1-20261114` (`github.actor == extreme4music-nexus`). It is **disabled on pull requests**, including forks. A separate workflow must be reviewed before promoting to any different trusted LW-D branch; never enable QA Secrets indiscriminately on untrusted branches.
6. The job uses only existing GitHub QA Secrets; installs SDK build-tools, checks intermediate SHA256, decodes QA keystore to an ephemeral runner directory, signs through `apksigner` using `trialum-qa`, verifies v2/v3 signature schemes, exact package and version, non-debuggable manifest, and the pinned `TRIALUM_QA_CERT_SHA256`. It then deletes temporary key files.
7. The **installable owner-signed artifact** is named `Trialum-LW-D-L3-1-OWNER-SIGNED-SIGNQA-<run-number>` with `Trialum-LW-D-L3.1-SIGNQA-SIGNED.apk`, checksum and BUILD-INFO. No public release or automated Play Console submission.

**No signing keys are stored in code or public artifacts. Never echo Secrets, token or service-account JSON.** The original `android-signing.yml` and `build-android.yml` for Codex-owned application variants are untouched.

## CI and phone acceptance

Previously [LW-D run 43589002580](https://github.com/extreme4music-nexus/Trialum/actions/runs/43589002580) passed 13 regression test groups, Gradle, compiled `assembleSignqa` and verified the existing Firebase/HTTPS resources in an unsigned APK. That is NOT proof of automatic signed build or real FCM delivery.

For this new signed pipeline, inspect the **trusted owner push** workflow run; pass requires success of both `build-lwd-signqa` and `sign-lw-d-signqa` and presence of the owner-signed artifact.

On owner's Samsung device:
1. Compare the existing `.signqa` installation's signing certificate SHA256 with the expected permanent QA signer if an older build is installed. Do not uninstall, clear data or overwrite any existing world to bypass certificate/version errors.
2. Install/update the owner-signed QA APK. Confirm package `com.trialum.ziivaiskra.signqa` and that the game's classic features, L3.1 lab, friends, AI and backups are preserved.
3. In Messages, explicitly opt into notifications, grant Android `POST_NOTIFICATIONS` and enable Friends channel. Test local notification separately; it proves only OS permission/channel.
4. Send a real message from a second friendship account while recipient is foreground, then background/locked. Check generic Android push, inbox status, no private text, consent-off and mute/block behavior. If `pushAvailable=false`, diagnose server independently; the GitHub build alone cannot prove remote delivery.
5. After owner's explicit PASS, publish final cross-version FCM/SignQA documentation and resume LW-D L3.2 DNA laboratory.

**Release, Codex Friends Debug, main, Google Play publishing, server and existing user data untouched.**
