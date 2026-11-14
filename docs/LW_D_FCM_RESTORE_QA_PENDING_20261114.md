# LW-D FCM recovery — SOURCE PATCH, DEVICE QA PENDING (14 Nov 2026)

**Owner instruction:** this work belongs to the LW-D lane; the Codex/beta/Play Console lane is not modified. Do not mark "FCM works" until owner sees a real remote Android notification on a physical device.

## Exact cause and previously working components
- Older opt-in Android FCM plumbing is in `TrialumPush.kt`, `TrialumFirebaseService.kt` and `TrialumApplication.kt`. Message notifications are generic and respect explicit user consent, mute/block, notification permission and `trialum_friends_optin`.
- Main/signed-APK workflow already reads `TRIALUM_FIREBASE_APP_ID`, `TRIALUM_FIREBASE_APP_ID_SIGNQA`, `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG`, `TRIALUM_FIREBASE_SENDER_ID`, `TRIALUM_FIREBASE_PROJECT_ID`, `TRIALUM_FIREBASE_API_KEY`. Repair history: PR #36 and PR #38; `docs/LW_FCM_ROOT_CAUSE_FIX_20261112.md`.
- In LW-D `.github/workflows/lw-d-android-qa.yml` passed **only** `TRIALUM_SOCIAL_API_URL` to Gradle. `lwd1` is a **different application**, `com.trialum.ziivaiskra.lwd1`, so the APK did not contain a correctly registered Firebase client App ID. Therefore `TrialumPush.configured()` returned false; the screen displayed "FCM is not configured". This is separate from local care reminders and the friend inbox.
- The older LWD workflow also signed the QA APK with an ephemeral GitHub runner debug keystore, incompatible with **owner-only LOCAL signing** and potentially incompatible across QA updates.

## Implemented on isolated branch
Branch `fix/lw-d-fcm-lwd1-20261114`, based on `feature/lw-d-forward-consolidation-lwc-20261114`. No main/beta/production/Play/server changes.
1. The LWD1 Gradle variant explicitly binds `trialumFirebaseAppIdLwd1` and never silently inherits the Release Firebase ID. It checks sender identity and rejects reuse of Release/SignQA/FriendsDebug app IDs.
2. The LWD Android QA workflow loads the **already-existing public Firebase client variables** and the new `TRIALUM_FIREBASE_APP_ID_LWD1`. Missing variables now fail closed instead of creating a falsely FCM-ready APK.
3. The job validates the HTTPS Friends endpoint, package ID, versionCode, compiled Firebase App ID, bundled AI dialogue and 3D lab files. **It uploads UNSIGNED only**. No owner keystore/key/password ever enters GitHub.
4. `scripts/sign-lwd1-local.sh` signs the verified APK on the owner's own machine using their existing **local QA signing key**. The user should not generate a new signer for an installed app.
5. Automated regression test `tests/lw-d-fcm-build.test.cjs` guards the bridge and local signing contract.

## One-time Firebase Console / GitHub variable prerequisite
Existing Firebase project must have a **fourth, package-specific Android app registration** with exact Android package name:

`com.trialum.ziivaiskra.lwd1`

In Firebase Console > Project settings > Your apps > Add app > Android, register this exact package **inside the current Trialum Firebase project** (do not create a new project). Copy its Firebase **Mobile App ID**, with format `1:<numeric-sender>:android:<hex>`. It must be different from the three existing package app IDs and have the same sender/project.

In GitHub > `extreme4music-nexus/Trialum` > Settings > Secrets and variables > Actions > Variables, set:
- `TRIALUM_FIREBASE_APP_ID_LWD1` = the new public Firebase Mobile App ID.
- Preserve existing `TRIALUM_FIREBASE_APP_ID`, `TRIALUM_FIREBASE_APP_ID_SIGNQA`, `TRIALUM_FIREBASE_APP_ID_SIGNDEBUG`, `TRIALUM_FIREBASE_SENDER_ID`, `TRIALUM_FIREBASE_PROJECT_ID`, `TRIALUM_FIREBASE_API_KEY` and `TRIALUM_SOCIAL_API_URL`.

These are Android client/project identifiers, **not private server credentials**. NEVER put service-account JSON, keystores, keystore passwords, device FCM tokens or social credentials into repo, chat, Actions variables, artifacts or logs. This source-only branch cannot register the fourth app or set account settings on your behalf.

## Build → local sign → phone test
1. After the new Firebase app and variable exist, run (or let the push trigger) **LW-D D1 — isolated Android QA** on the fix branch. A green run with the **Trialum-LW-D-L3-1-FCM-LOCAL-SIGNING-QA** artifact means APK configuration was inspected, **not that FCM delivery passed**.
2. Download `Trialum-LW-D-L3.1-FCM-UNSIGNED.apk` + `SHA256SUMS`; verify checksum locally, then sign **on the owner's own device/WSL machine** with a stable local QA key, for example:
   `bash scripts/sign-lwd1-local.sh Trialum-LW-D-L3.1-FCM-UNSIGNED.apk /private/path/local-qa.keystore QA_ALIAS Trialum-LW-D-L3.1-FCM-SIGNED.apk`.
   Keep keystore outside project. Script requires local `aapt`, `zipalign`, `apksigner` and prompts for passwords.
3. If Android says `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, the old `.lwd1` was likely signed with a different temporary runner debug certificate. **Do not uninstall it or clear its saved data merely to bypass this.** Preserve/verify backup and plan an owner-approved side-by-side test app or intentional migration.
4. Open Messages > Android notifications. With social account and server connected, opt in on two devices/identities, grant notification permission and check the Friends channel. Run the built-in **local notification test** (this only proves Android's notification channel).
5. Send a friend message with recipient app in foreground; then another while recipient is backgrounded/locked. Confirm a real generic Android system notification, as well as inbox delivery, with no message text exposed. Verify off/mute/block cases and reconnect without duplicate alerts.
6. If the UI still reports "FCM is not configured", distinguish **native APK config** from server `/v1/messages/status` showing `pushAvailable=false`. The production Debian configuration needs its own owner-side, read-only diagnostic; this GitHub change makes **no** deployment or database change.

## Gate
- Source/workflow branch: patch prepared; GitHub CI results to be checked separately.
- Firebase per-package app registration and GitHub Actions variable: **NOT VERIFIED HERE**.
- Locally signed installable APK: **NOT CREATED HERE**.
- Real device foreground/background notification: **OWNER QA PENDING**.
- Main/LW-C/beta/Play Console: **NOT TOUCHED**.
- After owner explicitly confirms a real notification, create permanent cross-version acceptance documentation and mark this task owner PASS. Only then resume LW-D L3.2 DNA lab.
