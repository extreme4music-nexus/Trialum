# TRIALUM 1.6-LW — Signing Phase S1: APK certificate inventory

**Date:** 2026-11-10  
**Status:** `CI_APK_SIGNATURES_VERIFIED` / `MAIN_AND_LWA_PHONE_SIGNERS_VERIFIED` / `INSTALLED_VERSION_CODES_VERIFIED` / `8_EXTERNAL_BACKUPS_COPIED_TO_H_RAID` / `OWNER_RESTORE_PASS_FOR_19_42_FILE` / `NEWEST_BACKUP_PHONE_TO_RAID_SHA256_PASS` / `OWNER_TESTED_19_42_HASH_PENDING` / `OFFLINE_BACKUP_PENDING` / `NO_SIGNING_CHANGE`  
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

## Owner's Galaxy A55 — installed versions and external backup presence (owner read-only PASS)

**Observed 2026-11-10 on Android user 0.** Official Android SDK 36 `aapt.exe dump badging` on the two copied installed `base.apk` files:

| Installed app | Package | versionCode | versionName | compile/target evidence |
|---|---|---:|---|---|
| Main | `com.trialum.ziivaiskra` | `23` | `1.5.6-rc1` | `compileSdkVersion=36` |
| Independent LW-A | `com.trialum.ziivaiskra.lwa` | `23` | `1.5.6-rc1-lwa` | `compileSdkVersion=36` |

**Important:** the new `1.6-LW-dev.1` app artifact has versionCode `24` but a **different signing certificate**, so it cannot replace the currently installed main app in place. Version increments are not enough to override certificate mismatch.

**External Backup/Restore files:** The owner ran `adb -d shell ls -l /sdcard/Download/Trialum` and found exactly **seven nonzero JSON files** on the physical phone in Android user 0 shared Downloads:

| Filename | File size (bytes) | Android timestamp | Declared game day |
|---|---:|---|---:|
| `TRIALUM_v1.5.5_day_589_20261110_073223_685_693e5c7c.json` | 356559 | 2026-11-10 07:32 | 589 |
| `TRIALUM_v1.5.5_day_1107_20261110_092123_592_28bd64c8.json` | 464855 | 2026-11-10 09:21 | 1107 |
| `TRIALUM_v1.5.5_day_1109_20261110_092536_683_193d7e04.json` | 467059 | 2026-11-10 09:25 | 1109 |
| `TRIALUM_v1.5.5_day_1109_20261110_092551_549_0c03313b.json` | 467059 | 2026-11-10 09:25 | 1109 |
| `TRIALUM_v1.5.5_day_1111_20261110_163925_132_26ada7d0.json` | 480989 | 2026-11-10 16:39 | 1111 |
| `TRIALUM_v1.5.5_day_1111_20261110_194218_704_909743e1.json` | 480989 | 2026-11-10 19:42 | 1111 |
| `TRIALUM_v1.5.5_day_1111_20261110_220250_375_76a1b243.json` | 479923 | 2026-11-10 22:02 | 1111 |

**Interpretation and limits:** filenames describe their own game snapshot/version naming and do not imply installed APK version; these 7 files are **nonzero and present**, not yet cryptographically compared against any archive or parsed/validated for full world/XP/achievements. No user save content or social credentials were accessed. Owner must create an independent off-phone copy (`adb -d pull /sdcard/Download/Trialum <private PC location>`) before signature migration. No `restore`, `uninstall`, `rm`, `clear` or overwrite command permitted.

**Next gate:** copy all seven files to a private computer location, verify 7 copies and matching per-file SHA-256 between phone and copied file (via `adb -d shell sha256sum ...` when available), parse JSON locally as read-only, confirm application state counts via private local inspection, and make at least one separate offline copy. The exact private debug signing key remains unconfirmed/recoverability unknown.

## Updated owner backup evidence — 10 Nov 2026, 23:25 local (read-only audit of owner-reported result)

**OFF-DEVICE COPY PRESENT — OWNER OBSERVED.** Windows CMD directory listing shows **eight** nonempty JSON backups in `H:\Trialum-Signing-Safety\Trialum` (H: labeled RAID Disk), totaling **3,678,420 bytes**. The initial seven snapshots were copied and an additional snapshot created at 23:24:49. The common 23:25 Windows file timestamps are copy times, **not** the original game-state creation times; use embedded filename timestamps for ordering. Files and specific observations:

| Backup | Bytes | Evidentiary significance |
|---|---:|---|
| `TRIALUM_v1.5.5_day_1111_20261110_194218_704_909743e1.json` | 480989 | **OWNER RESTORE PASS:** owner explicitly restored this exact file and visually confirmed existing achievements unchanged |
| `TRIALUM_v1.5.5_day_1111_20261110_232449_514_ae3a42b6.json` | 480987 | Newest backup by filename creation time, at 23:24:49; file presence/size confirmed, no separate restore comparison reported |
| `TRIALUM_v1.5.5_day_1111_20261110_220250_375_76a1b243.json` | 479923 | Another later snapshot chronologically than the owner-tested 19:42 file; not the tested owner-selected golden file |
| Five older snapshot files | nonzero, listed in prior table | Retained alongside latest snapshots, no overwriting reported |

**Distinctions:** the user-selected *confirmed-good* backup is **19:42 (480,989 bytes)**; the newest *created* snapshot is **23:24 (480,987 bytes)**; the 22:02 snapshot is **479,923 bytes**. Larger file size is not proof of completeness or currency. A visually successful Restore is a genuine owner functional PASS, **not** cryptographic integrity verification or field-by-field diff of saved worlds. SHA-256 on original phone copies vs off-phone copies, JSON validity and separate cold/offline copy remain **PENDING**. The owner says no changes to achievements after the restore. Do not upload private JSON snapshots, achievements, social identity or keystores to a public repository.

**Next:** locally hash the selected 19:42 file and the newest 23:24 file on both PC and phone using `certutil -hashfile` and `adb -d shell sha256sum`. Confirm exact matching SHA-256 per filename. Keep an independent protected backup outside the active H: storage. After that assess existing 1.5.6 debug-signing-key continuity; no uninstall or app updates.

## Owner SHA-256 evidence — newest backup independently matched

**OWNER READ-ONLY HASH PASS — 2026-11-10 (Windows CMD + Galaxy A55):**
- Exact snapshot: `TRIALUM_v1.5.5_day_1111_20261110_232449_514_ae3a42b6.json`, 480,987 bytes, from filename creation time 23:24:49.
- Windows copy: `H:\Trialum-Signing-Safety\Trialum\TRIALUM_v1.5.5_day_1111_20261110_232449_514_ae3a42b6.json`, checked with `certutil -hashfile ... SHA256`.
- Original phone file: `/sdcard/Download/Trialum/TRIALUM_v1.5.5_day_1111_20261110_232449_514_ae3a42b6.json`, checked with `adb -d shell sha256sum`.
- **Both independently reported SHA-256** `0b4b353e4b3f1219b48dbe015b1d4be7740afb9528c21b636baa469d9015dd5e` — **HASH MATCH / PASS**.
- This proves byte-for-byte consistency of the particular phone and H: snapshot copy, **not** completeness of every game achievement or a successful restore of this *specific* 23:24 file. The user separately reported successful restore with unchanged visible achievements of the **19:42** 480,989-byte snapshot. SHA-256 comparison for that 19:42 snapshot is **pending**.
- Independent cold/offline backup outside the H: RAID is also **pending**. No device data or signing key was modified in this audit.

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

**S1 device status: installed app signatures and versions OWNER PASS, 8 local backup copies observed, owner Restore PASS for 19:42 snapshot. SHA-256 copy integrity + separate offline copy PENDING.**

## S1 exit requirements

- [x] Establish exact GitHub source SHA, artifact IDs, APK SHA-256 and signer fingerprint matrix.
- [x] Verify original archived APK signatures via official Android `apksigner`.
- [x] Check original GitHub workflow's debug-signing policy and at least one actual run log, without reading any signing secret.
- [x] Obtain Android user 0 installed main package SHA-256 directly from the owner's Galaxy A55 and match against archived CI.
- [x] Obtain Android user 0 installed .lwa signer SHA-256 with Android Build Tools 36 apksigner: exact match with installed main / archived 1.5.6-F run 42882616804.
- [x] Verify installed application IDs, versions, and versionCode 23 via Android SDK 36 aapt; do not bypass restricted additional Android profiles.
- [x] Confirm at least 7 nonzero phone Downloads/Trialum snapshots by ADB and 8 off-phone copies on H: RAID by owner CMD listing.
- [x] Copy off-phone backups to H: RAID; owner observed 8 nonzero files.
- [x] Owner performed Restore of exact 19:42 480,989-byte backup and reports achievements unchanged (functional, not cryptographic, PASS).
- [x] Verify newest 23:24 snapshot SHA-256 matches exactly on Galaxy A55 and H: RAID.
- [ ] Verify separately owner-restored 19:42 snapshot SHA-256 on phone vs H: RAID; validate JSON locally and make a separate offline backup.
- [ ] Confirm presence and integrity of existing **external** verified backups kept outside the installed app; note that internal rescue vaults are lost on uninstall.
- [ ] Decide safe old-app to stable-key transition strategy; default **independent QA first**, no destructive upgrades.
- [ ] Owner acknowledges S1 and authorizes S2 key custody.

**S1 is NOT fully closed**, and the Living World session work remains paused.

See [official signing master plan](TRIALUM_1.6_LW_ANDROID_SIGNING_MASTER_PLAN.md), [LW-A recovery](LW_A_RECOVERY_INCIDENT_20261110.md), [1.6-LW baseline](TRIALUM_1.6_LW_BASELINE.md).
