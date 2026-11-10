# LW-A parallel-installable Android QA

This is a **development-only** Android build, not a production or Google Play release.

## Why this build exists

The original `com.trialum.ziivaiskra` APK on a tester's phone may have a different signing certificate from GitHub Actions. Android will not install an update signed by a different certificate. Uninstalling the original would destroy its app-private data and Android Keystore social credential. An exported world JSON does **not** export that credential or preserve existing social identity.

The separate Gradle `lwa` build type creates `com.trialum.ziivaiskra.lwa`, labeled **Trialum LW-A Test**, with its own application UID, WebView IndexedDB/localStorage, Android Keystore scope, FileProvider authority and `trialum-lwa://invite/...` deep-link scheme. The normal `debug` build retains its original package, label, signature handling and `trialum://invite/...` scheme.

## Build / obtain

GitHub Actions `.github/workflows/build-android.yml` builds the usual `assembleDebug` artifact **and** `assembleLwa`, publishing `Trialum-LW-A-Parallel-Test-APK`. QA uses the existing optional `TRIALUM_SOCIAL_API_URL` repository variable for HTTPS social connectivity. Firebase and Play Games identifiers are intentionally not supplied to the QA build, so those integrations remain off unless separately tested in a controlled environment.

Local command for developers with the Android SDK: `gradle -p android-template :app:assembleLwa`.

## Safe QA procedure

1. **Never uninstall or clear data** from `com.trialum.ziivaiskra` or change its signing certificate. Keep original app, 10.38 MiB ADB archive, and the exported Trialum world JSON secure.
2. Install the separate QA APK with `adb -s SERIAL install -r path/to/app-lwa.apk`. Verify `adb -s SERIAL shell pm list packages | grep trialum` lists **both** packages.
3. In the new **Trialum LW-A Test** app use **Backup/Restore → Restore** and select the exported 1.5.5 world JSON. Confirm the restore dialogue intentionally; this changes **only the QA app's** fresh world.
4. Confirm the expected game day, four pets, four habitats and history entries. World JSON restores game state, **not** social credentials, friends or push identity. Create a separate test social profile as required.
5. On two distinct physical phones test room entry, return, renew, duplicate/pending visit denial, expiration, independent presence and stale client rejection. Keep `PRESENCE_ENABLED=false` until the intended gated activation and rollback checks are prepared.
6. Keep PR #18 draft and issue #19 open until two-phone independent QA passes. Do not begin LW-B or publish to Play Store.

**Do not mistake a CI build PASS for a successful restore, preserved identity, or completed LW-A acceptance.**
