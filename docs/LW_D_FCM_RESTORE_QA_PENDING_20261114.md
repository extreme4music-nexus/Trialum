# Trialum LW-D — reuse existing Firebase Signing QA app (owner decision, 14 Nov 2026)

STATUS: Source/CI review, device testing still pending. This is not owner PASS.

## Three existing Firebase Android registrations: strict responsibilities

- `com.trialum.ziivaiskra` (official Release) — **Codex / beta / Play Console lane**.
- `com.trialum.ziivaiskra.signdebug` (Friends Debug) — **Codex lane**.
- `com.trialum.ziivaiskra.signqa` (Signing QA) — **LW-D lane** in this patch.

The user has already configured the three Firebase Android App IDs and the shared Firebase client identifiers in GitHub Actions Variables. **Do not create a fourth Firebase Android app. Do not require `TRIALUM_FIREBASE_APP_ID_LWD1`. Never take another lane's App ID.**

## Confirmed root cause

The earlier LW-D workflow assembled `lwd1` with package `com.trialum.ziivaiskra.lwd1` and passed the social HTTPS endpoint only. That package is distinct from the registered Release/SignQA/FriendsDebug packages, and lacked matching Firebase client resources. Thus `TrialumPush.configured()` returned unavailable. The Firebase SDK, channel `trialum_friends_optin`, opt-in notification permission and generic privacy-safe server delivery logic already existed from the LW-A push fixes (PR #36 and #38) and are preserved.

A misguided intermediate LW-D patch proposed a fourth Android app/variable. **Owner corrected the ownership mapping**. That requirement and its build failure were self-created; they are now removed from this LW-D candidate.

## How the LW-D candidate works

- The existing Gradle `signqa` build type, Android applicationId `com.trialum.ziivaiskra.signqa`, already binds `trialumFirebaseAppIdSignqa`. It checks that the App ID is distinct from official Release's ID.
- This isolated LW-D workflow now assembles **only `:app:assembleSignqa`** from the LW-D branch, taking already-existing public GitHub Variables: `TRIALUM_FIREBASE_APP_ID`, `TRIALUM_FIREBASE_APP_ID_SIGNQA`, `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG`, `TRIALUM_FIREBASE_SENDER_ID`, `TRIALUM_FIREBASE_PROJECT_ID`, `TRIALUM_FIREBASE_API_KEY` and `TRIALUM_SOCIAL_API_URL`.
- The workflow verifies the actual package, compiled QA Firebase App ID, sender/project and social HTTPS endpoint inside the produced APK, plus restored LW-C AI/dialogue files and L3.1 3D lab assets.
- `MainActivity.kt` allows LW-D 3D fullscreen on existing `.signqa` plus historical `.lwd1` preview only. Codex's Release and Friends Debug packages do not gain LW-D native fullscreen behavior.
- The workflow uploads an **UNSIGNED** `.signqa` QA APK artifact for **local owner signing**. No signed APK, password, owner signing key or private service-account credential enters the LW-D GitHub job. The independent Codex workflows `android-signing.yml` and `build-android.yml` are unchanged.
- `scripts/sign-lw-d-signqa-local.sh` signs **only** package `com.trialum.ziivaiskra.signqa` on the owner's machine. Use the already-existing QA signing certificate and keep all signing data outside GitHub.

## Evidence and acceptance

The earlier [CI run 43583088891](https://github.com/extreme4music-nexus/Trialum/actions/runs/43583088891) confirmed the 3D/social/AI regression test groups and Gradle Kotlin DSL setup PASS. It then failed because the **incorrectly introduced** fourth-app variable was absent. **That result does not mean the three existing App IDs were missing.**

For this corrected branch, require:
1. LW-D source regression tests and actual `assembleSignqa` CI success.
2. Artifact `Trialum-LW-D-L3.1-SIGNQA-UNSIGNED.apk` with SHA256 and BUILD-INFO verified in GitHub Actions.
3. Local signature with the **existing stable QA certificate** using:
   `bash scripts/sign-lw-d-signqa-local.sh Trialum-LW-D-L3.1-SIGNQA-UNSIGNED.apk /secure/local/trialum-qa.keystore QA_ALIAS Trialum-LW-D-L3.1-SIGNQA-SIGNED.apk`
   Requires local Android build-tools `aapt`, `zipalign`, `apksigner`. Never disclose keystore location/password in public logs.
4. Check the APK signer matches any existing `.signqa` installation **before** attempting an update. If Android rejects the signer or versionCode, do **not** uninstall or clear app data; preserve installed state and evaluate backup/migration with owner.
5. On phone, permit Android notifications and manually opt into Friends push. In Messages, use the local notification self-test to confirm channel and permissions, **but distinguish that from actual FCM delivery**.
6. With two eligible friend identities, send a preset message when the recipient app is foreground and when it is background/locked. Confirm generic push notification, inbox delivery, consent off, block/mute, reconnect behavior and no duplicated alerts.
7. Diagnose server `pushAvailable=false` separately from client Firebase configuration if the APK is correctly configured but still reports FCM unavailable. Do not change production server without explicit owner authorization.

## Safety / scope
- `main`, the Codex/beta/Play Console lane, official Release and FriendsDebug build workflows, server, DB, existing saves and Signing Secrets: **NOT TOUCHED**.
- This patch's target is `feature/lw-d-forward-consolidation-lwc-20261114` via Draft PR.
- Physical notification delivery and user approval: **OWNER QA PENDING**.
- Final permanent cross-version documentation and next LW-D L3.2 development follow successful device confirmation.
