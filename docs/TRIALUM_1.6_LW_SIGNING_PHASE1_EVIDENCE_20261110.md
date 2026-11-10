# TRIALUM 1.6-LW — Signing Phase S1: APK certificate inventory

**Date:** 2026-11-10  
**Status:** `CI_APK_SIGNATURES_VERIFIED` / `MAIN_AND_LWA_PHONE_SIGNERS_VERIFIED` / `VERSION_AND_BACKUP_VALIDATION_PENDING` / `NO_SIGNING_CHANGE`  
**Policy:** No replacement, uninstall, clear-data, Restore, keystore rotation or distribution until the actual installed device signatures and data backups are independently checked.

## Independent proof

- [Official Android `apksigner` inventory run #42907895965](https://github.com/extreme4music-nexus/Trialum/actions/runs/42907895965) — **PASS**; five archived APK files verified. Read-only GitHub workflow downloads original historical artifacts, does not sign or build, and publishes only non-secret certificate SHA-256 fingerprints plus APK SHA-256 hashes in `Trialum-1.6-LW-Phase1-Certificate-Inventory`.
- Last 1.6-LW dual Android CI: [run #42903151143](https://github.com/extreme4music-nexus/Trialum/actions/runs/42903151143), SHA `5b547d6b08f1adcf1d05266864008a24b6686efa`, versionCode=24. Older 1.5.6-F dual: [run #42882616804](https://github.com/extreme4music-nexus/Trialum/actions/runs/42882616804). Earlier historical comparison: [run #42881557335](https://github.com/extreme4music-nexus/Trialum/actions/runs/42881557335).
- The normal `1.6-LW` debug APK and the `.lw16` isolated APK from the same run use the **same debug signing certificate**. Those packages have **different application IDs and independent app storage**; matching signer does not merge their data.
- GitHub Actions log for run #42903151143 shows `TRIALUM_PGS_DEBUG_KEYSTORE_B64` was **unset/empty at build time** and the script emitted `Using GitHub runner debug signature`. That is corroborated by two different `1.5.6-F` main APK signer SHA-256 values from different runner jobs. Do not assert the current GitHub secret state without fresh owner inspection.

## Owner's Galaxy A55 — main installed APK independently verified

**OWNER READ-ONLY DEVICE PASS (2026-11-10):** The user connected a Galaxy A55 via ADB, filtered `pm list packages --user 0` and confirmed both `com.trialum.ziivaiskra` and `com.trialum.ziivaiskra.lwa` were installed. Android user 151 (Samsung Secure Folder or other managed profile) was inaccessible to ADB shell; testing is limited to Android user 0. The owner pulled **only** the current main application's `base.apk` (10,807,510 bytes) from `/data/app/.../com.trialum.ziivaiskra-.../base.apk` and checked it with the official locally installed `H:\AndroidSDK\build-tools\36.0.0\apksigner.bat verify --verbose --print-certs`.

- Result: `Verifies`, APK Signature Scheme **v2 = true**, single signer, `C=US, O=Android, CN=Android Debug`, RSA 2048-bit.
- **Installed main APK signer SHA-256 = `8c8f61a96d2b4e636d61b916b353ef4eae5784ca84be0b68bfdc24156df76ec2`**. This matches GitHub's later 1.5.6-F build run **42882616804** exactly by certificate fingerprint. It **does not prove byte-identical APK contents** without comparing the APK SHA-256.
- **The new GitHub 1.6-LW debug APK on run 42903151143 has signer SHA-256 `010ca8504660efd3ae835439761c95df92cd79d63620f4fae4cd63b9560f7887`, DIFFERENT.** Therefore it **cannot be an in-place Android update** of the current `com.trialum.ziivaiskra` install; never try to "fix" by uninstalling or clearing data.
- The historic `.lwa` app is installed, **but its actual signer still needs read-only extraction**. The new `.lw16` QA package was not listed for Android user 0. World/achievement/backup integrity has **not** been checked by this certificate readout. No application installation or signing change took place.

**Next:** `adb -d shell pm path com.trialum.ziivaiskra.lwa`, `adb -d pull "<returned base.apk path>" "H:\AndroidSDK\platform-tools\Trialum-LWA-installed-base.apk"`, then `"H:\AndroidSDK\build-tools\36.0.0\apksigner.bat" verify --verbose --print-certs "H:\AndroidSDK\platform-tools\Trialum-LWA-installed-base.apk"`. This must be limited to Android user 0 and no update/uninstall should be attempted.

## Owner's Galaxy A55 — historic LW-A installed APK signer verified

**OWNER DEVICE READ-ONLY PASS (2026-11-10, Android user 0):** Using `adb -d shell pm path --user 0 com.trialum.ziivaiskra.lwa`, the owner retrieved the installed `.lwa` `base.apk` from `/data/app/~~HUGsTF6grju-tNuG5YbdjA==/com.trialum.ziivaiskra.lwa-_cf3TJP9suqluUW7boK7tQ==/base.apk` to local `Trialum-LWA-installed-base.apk` (10,807,390 bytes), then ran official `H:\AndroidSDK\build-tools\36.0.0\apksigner.bat verify --verbose --print-certs`.

- Result: `Verifies`; APK Signature Scheme **v2 = true**; single **Android Debug, RSA 2048-bit** signer.
- **Installed LW-A APK certificate SHA-256:** `8c8f61a96d2b4e636d61b916b353ef4eae5784ca84be0b68bfdc24156df76ec2`.
- **Exact fingerprint match:** the installed main `com.trialum.ziivaiskra`, installed `com.trialum.ziivaiskra.lwa`, archived GitHub 1.5.6-F debug and archived LW-A parallel APK from run `42882616804` all use the **same certificate**. This identifies their signing identity; APK byte-for-byte identity remains unverified pending `certutil -hashfile` comparison with published APK SHA-256.
- **Important distinction:** SHA-256 certificate fingerprints are public. They do **not** disclose or recreate the private signing key. Until that exact private key is recovered and safeguarded, an automatically produced APK signed with a new owner key CANNOT directly update either existing package with the same application ID. No package uninstall/clear-data is authorized.
- **Remaining S1:** inspect versionCode/versionName from installed APKs with `aapt dump badging`; verify independent external game JSON backups and restore safety without modifying the main installed app; evaluate signing-key continuity strategy. Do not claim world progress verified from this certificate check.

## Verified APK certificate matrix — SHA-256 (public certificate metadata)

| Artifact | GitHub run | Android application ID | Version | Signing certificate SHA-256 |
|---|---:|---|---|---|
| 1.5.6-F debug (earlier) | 42881557335 | `com.trialum.ziivaiskra` | `1.5.6-rc1` | `47d20d8ed7388a82925c71300e69f2a581d5d363779708d25e87ee6448b2b8ce` |
| 1.5.6-F debug (later) | 42882616804 | `com.trialum.ziivaiskra` | `1.5.6-rc1` | `8c8f61a96d2b4e636d61b916b353ef4eae5784ca84be0b68bfdc24156df76ec2` |
| LW-A parallel test (same later run) | 42882616804 | `com.trialum.ziivaiskra.lwa` | `1.5.6-rc1-lwa` | `8c8f61a96d2b4e636d61b916b353ef4eae5784ca84be0b68bfdc24156df76ec2` |
| 1.6-LW debug | 42903151143 | `com.trialum.ziivaiskra` | `1.6-LW-dev.1` | `010ca8504660efd3ae835439761c95df92cd79d63620f4fae4cd63b9560f7887` |
| 1.6-LW isolated test | 42903151143 | `com.trialum.ziivaiskra.lw16` | `1.6-LW-dev.1-test` | `010ca8504660efd3ae835439761c95df92cd79d63620f4fae4cd63b9560f7887` |

The report also lists the exact APK SHA-256 for all five artifacts and checks `apksigner verify --verbose --print-certs` against Android build tools 35.0.0. See the inventory run artifact for those hashes. These values are **APK evidence**, not evidence about which version is installed on the owner's phone.

**Conclusions:** GitHub runner-generated debug certificates are not consistently reusable across runs in the examined evidence. A newer APK with a **different signing certificate but the same application ID** cannot be installed in place as a normal Android update. New permanent signing keys must be treated as new identities unless old-to-new Android package identity migration is demonstrably safe. **Do not attempt to force an update by uninstalling**, which would remove app-private world, pinned rescues and social Android Keystore credentials.

## Next required owner-side observation — Windows PC + Galaxy A55

On the owner's own Windows PC with Android SDK platform-tools and a USB debugging connection:

```powershell
adb devices
adb shell pm list packages | Select-String trialum
adb shell pm path com.trialum.ziivaiskra
adb shell pm path com.trialum.ziivaiskra.lwa
adb shell pm path com.trialum.ziivaiskra.lw16
```

A package that is not installed returns nothing. Do **not** install any of the archived APKs merely to make it appear.

For each actually installed package, copy **only its installed base.apk** to a private PC directory using `adb pull`. This is read-only on the phone. Then run the Android SDK's `apksigner.bat verify --verbose --print-certs <local-apk>` and record the public `Signer #1 certificate SHA-256 digest`. The output should contain no passwords and need not include world data. Compare it to the table above; any mismatch means `UPDATE_UNVERIFIED`, and no install is attempted.

If the owner has no ADB or Android build-tools installed, set that up independently; do not request private .jks files/passwords over chat. Never ask the owner to upload world backups to a public repository.

**S1 device status: PENDING** — no direct phone or locally installed APK inspection is claimed.

## S1 exit requirements

- [x] Establish exact GitHub source SHA, artifact IDs, APK SHA-256 and signer fingerprint matrix.
- [x] Verify original archived APK signatures via official Android `apksigner`.
- [x] Check original GitHub workflow's debug-signing policy and at least one actual run log, without reading any signing secret.
- [x] Obtain Android user 0 installed main package SHA-256 directly from the owner's Galaxy A55 and match against archived CI.
- [x] Obtain Android user 0 installed .lwa signer SHA-256 with Android Build Tools 36 apksigner: exact match with installed main / archived 1.5.6-F run 42882616804.
- [ ] Verify installed versions with read-only aapt; account for inaccessible additional Android users without bypassing protection.
- [ ] Confirm presence and integrity of existing **external** verified backups kept outside the installed app; note that internal rescue vaults are lost on uninstall.
- [ ] Decide safe old-app to stable-key transition strategy; default **independent QA first**, no destructive upgrades.
- [ ] Owner acknowledges S1 and authorizes S2 key custody.

**S1 is NOT fully closed**, and the Living World session work remains paused.

See [official signing master plan](TRIALUM_1.6_LW_ANDROID_SIGNING_MASTER_PLAN.md), [LW-A recovery](LW_A_RECOVERY_INCIDENT_20261110.md), [1.6-LW baseline](TRIALUM_1.6_LW_BASELINE.md).
