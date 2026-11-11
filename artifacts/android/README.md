# Android — permanently owner-signed APKs

Three application folders are updated **automatically on accepted code changes to `main`**. Git commits track the latest APKs and their plain-text SHA-256 provenance. These are internal and private builds; no Google Play upload is implied.

| Folder | Current APK | Package ID | Permanent signing certificate |
|---|---|---|---|
| [Signing-QA](Signing-QA/README.md) | `Signing-QA/Trialum-signqa.apk` | `com.trialum.ziivaiskra.signqa` | QA SHA-256 `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c` |
| [Friends-Debug](Friends-Debug/README.md) | `Friends-Debug/Trialum-signdebug.apk` | `com.trialum.ziivaiskra.signdebug` | **Same** QA SHA-256 `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c` |
| [Release](Release/README.md) | `Release/Trialum-release.apk` | `com.trialum.ziivaiskra` | Release SHA-256 `d8e646b45fcfeb68ec044bfa65157200c0d6962df6e81e97d54ce448f8af1a67` |

**On the owner's desktop (after the automated publish has passed):**

```powershell
git pull origin main
Get-ChildItem .\artifacts\android -Recurse -Filter *.apk
```

Run commands from the repository clone root. Both Signing QA and Friends Debug may be installed on the same Galaxy A55, have *separate* sandboxed local worlds and social accounts, and use the same existing HTTPS Friends server. To test invitations, register a separate voluntary profile in each and send an invite between them.

**DO NOT install Release over a historical `1.5.6-rc1` main app** signed with the earlier runner debug key: Android refuses a signer mismatch, and uninstalling to bypass it destroys private app data. Keep old `.lwa`/`.lw16` installs and verified backup files untouched. The `signdebug` app is debuggable and is for private testing only.

Each folder's `provenance.txt` includes immutable source SHA, package, version, signing-certificate SHA-256, APK SHA-256 and private-only status. To validate on desktop: `Get-FileHash .\artifacts\android\Signing-QA\Trialum-signqa.apk -Algorithm SHA256` and compare it with the recorded value.
