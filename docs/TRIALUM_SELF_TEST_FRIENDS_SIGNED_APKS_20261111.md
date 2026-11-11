# Trialum 1.6-LW — solo Friends testing with two permanently signed Android apps

**Owner request, 11 November 2026:** Do not depend on a colleague overseas responding to invitations. Deliver **two independent, simultaneously installable Android test applications** connected to the same already working Friends HTTPS server; preserve the stable owner signing identities and all previous local worlds.

## Exactly three APKs from one source commit (1.6-LW-dev.2, versionCode 25)

| APK file in INTERNAL-ONLY GitHub artifact | Android package ID | Signer | Purpose |
|---|---|---|---|
| `Trialum-1.6-LW-release-SIGNED-CANDIDATE.apk` | `com.trialum.ziivaiskra` | Permanent Release `d8e646b4…f8af1a67` | Main owner-signed candidate — **DO NOT** install over old debug-signed main installation |
| `Trialum-1.6-LW-signqa-SIGNED-CANDIDATE.apk` | `com.trialum.ziivaiskra.signqa` | Permanent QA `681771d0…96f8296c` | Existing signed QA app; in-place update from prior signed v24 |
| `Trialum-1.6-LW-signdebug-SIGNED-CANDIDATE.apk` | `com.trialum.ziivaiskra.signdebug` | **Same permanent QA** `681771d0…96f8296c` | New, separately installable **debuggable** companion for second Friends profile and testing |

The two QA test apps have **different package names and sandboxed WebView stores, native Android Keystore scopes, social credentials and local worlds**. They deliberately share the **same QA signing certificate** and the **same HTTPS Friends backend address** from the existing GitHub Variable `TRIALUM_SOCIAL_API_URL`. Separate app identity (not separate signing certificate) enables two independent test accounts. The debug companion is **not** a public release and should not be used for personal or production secrets; its Android `debuggable=true` flag is intentional for owner-only troubleshooting.

All three builds must come from the **same GitHub Actions manual signing run on `main`**. The workflow checks app ID, `versionCode=25`, correct debuggability, bundled JS assets, manifest labels/schemes, embedded HTTPS Friends resource and cryptographic signer fingerprint **before uploading any signed APK**. On PR/push, only no-secret preflight is permitted; temporary debug/unsigned APKs cannot be published as installables.

## Galaxy A55 — recommended self-test (no changes to old installed worlds)

1. Obtain the private `Trialum-1.6-LW-OWNER-SIGNED-INTERNAL-ONLY` artifact from the **new owner-dispatched main run after this change merges**. Old artifacts do not contain this companion and do not become updated automatically.
2. Install/update `com.trialum.ziivaiskra.signqa` via the `signqa` APK **without clearing storage**. Install `com.trialum.ziivaiskra.signdebug` via its APK as a **new** app. Do not install the Release candidate over the historic debug-signed main game or modify historic `.lwa` / `.lw16`.
3. Launch **Trialum Signing QA** and **Trialum Friends Debug** independently. In the Friends tab, both should display the same configured HTTPS server. Each app must opt in to social networking and, if new, create its *own* nickname/profile. They should have different social identities.
4. In one app create a friend invite, copy its short code, switch to the other app and paste/preview/accept it. The friends list should update on both after refreshing. Repeat from the other direction if helpful. No remote colleague is needed.
5. Test controlled visits/shared playground with one pet per test world; switch apps and confirm presence/return and 2-hour local session behavior. Test reconnect after temporary airplane mode with care. Preserve existing backup files; restore only a **verified COPY** into these isolated QA apps if desired.
6. Record: app installs PASS/FAIL, distinct social profiles PASS/FAIL, one-use invite and acceptance PASS/FAIL, friends list and shared visit PASS/FAIL, expiry/reconnect PASS/FAIL, and unchanged historic installed main/old `.lwa` world PASS/FAIL.

## Boundaries and non-regressions

- Existing Release key and `signqa` QA key **never rotate**. New `.signdebug` is signed with that same QA key for its entire lifetime. No private keystore, password or Base64 in source, PR comments or artifacts.
- Source APKs compiled by `.github/workflows/build-android.yml` with ephemeral debug cert are **CI diagnostics only**. They are not installable releases or a supported migration path for previous main/.lwa apps.
- User already has separately verified off-device JSON backups; never uninstall/clear data or overwrite originals just to test.
- No server/NAS/Caddy/Postgres changes, no database resets, no Play release, no advertising, no reliance on remote participants.
- Separate UI/dev debug ability does **not** replace independent QA, especially for social authorization, privacy, abuse prevention and data retention.
