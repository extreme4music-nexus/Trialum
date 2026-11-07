# Android source template (future APK build)

This is **source code only**: it has not been compiled or tested on Android hardware, and no APK is included. Android Studio, an Android SDK, Gradle 8.x and a Gradle wrapper/environment are needed to build it.

- The `syncWebAssets` Gradle task bundles the **same** root game `index.html`, `js/`, `assets/`, `vendor/` into the APK.
- `WebViewAssetLoader` serves them from `https://appassets.androidplatform.net/assets/web/` for a stable, secure origin (unlike an arbitrary file:// URL).
- `TrialumAndroid.updateState(...)` receives only a limited snapshot of care metrics; no remote API is used.
- `CareWorker` checks care thresholds at roughly 6-hour intervals. Android may postpone background jobs because of battery optimizations. It predicts hunger/play/cleaning trends from last snapshot; it does **not** run the entire JavaScript simulation in the background.
- Android 13+ POST_NOTIFICATIONS is requested at start. Alerts are opt-in and can be turned off in OS settings.
- Security: the app only loads its packaged HTML and blocks navigation to other hosts. The JavaScript bridge can only update a restricted local care snapshot. Review and test before production.

This template is intentionally separate from the tested HTML game. See `../docs/ANDROID.md`.
