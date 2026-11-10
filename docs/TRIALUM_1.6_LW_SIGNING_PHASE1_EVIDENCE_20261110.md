# TRIALUM 1.6-LW — Signing Phase S1: APK certificate inventory

**Date:** 2026-11-10  
**Status:** `CI_APK_SIGNATURES_VERIFIED` / `INSTALLED_DEVICE_CERTIFICATES_PENDING` / `NO_SIGNING_CHANGE`  
**Policy:** No replacement, uninstall, clear-data, Restore, keystore rotation or distribution until the actual installed device signatures and data backups are independently checked.

## Independent proof

- [Official Android `apksigner` inventory run #42907895965](https://github.com/extreme4music-nexus/Trialum/actions/runs/42907895965) — **PASS**; five archived APK files verified. Read-only GitHub workflow downloads original historical artifacts, does not sign or build, and publishes only non-secret certificate SHA-256 fingerprints plus APK SHA-256 hashes in `Trialum-1.6-LW-Phase1-Certificate-Inventory`.
- Last 1.6-LW dual Android CI: [run #42903151143](https://github.com/extreme4music-nexus/Trialum/actions/runs/42903151143), SHA `5b547d6b08f1adcf1d05266864008a24b6686efa`, versionCode=24. Older 1.5.6-F dual: [run #42882616804](https://github.com/extreme4music-nexus/Trialum/actions/runs/42882616804). Earlier historical comparison: [run #42881557335](https://github.com/extreme4music-nexus/Trialum/actions/runs/42881557335).
- The normal `1.6-LW` debug APK and the `.lw16` isolated APK from the same run use the **same debug signing certificate**. Those packages have **different application IDs and independent app storage**; matching signer does not merge their data.
- GitHub Actions log for run #42903151143 shows `TRIALUM_PGS_DEBUG_KEYSTORE_B64` was **unset/empty at build time** and the script emitted `Using GitHub runner debug signature`. That is corroborated by two different `1.5.6-F` main APK signer SHA-256 values from different runner jobs. Do not assert the current GitHub secret state without fresh owner inspection.

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
- [ ] Obtain installed-package IDs, versionCodes and signer SHA-256 directly from owner's physical phone (or verified installed APK copies).
- [ ] Confirm presence and integrity of existing **external** verified backups kept outside the installed app; note that internal rescue vaults are lost on uninstall.
- [ ] Decide safe old-app to stable-key transition strategy; default **independent QA first**, no destructive upgrades.
- [ ] Owner acknowledges S1 and authorizes S2 key custody.

**S1 is NOT fully closed**, and the Living World session work remains paused.

See [official signing master plan](TRIALUM_1.6_LW_ANDROID_SIGNING_MASTER_PLAN.md), [LW-A recovery](LW_A_RECOVERY_INCIDENT_20261110.md), [1.6-LW baseline](TRIALUM_1.6_LW_BASELINE.md).
