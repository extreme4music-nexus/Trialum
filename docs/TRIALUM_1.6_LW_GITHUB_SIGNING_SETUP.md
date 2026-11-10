# Trialum 1.6-LW — GitHub-only Android signing setup (owner runbook)

**Status (10 Nov 2026):** GitHub signing infrastructure **MERGED INTO MAIN** via [PR #24](https://github.com/extreme4music-nexus/Trialum/pull/24) (merge `3f7e65306c5217cc1150a0612dc24f1c1616c98d`). Exact-source [CI run #42919377541](https://github.com/extreme4music-nexus/Trialum/actions/runs/42919377541) **PASS** for game/backup regressions, unsigned release and isolated signqa compilations, independent APK identity checks and actual **ephemeral CI-key apksigner rehearsal**. Production signing job **SKIPPED intentionally** and **NO PRIVATE OWNER KEYS GENERATED OR STORED BY THE ASSISTANT.** No secrets have been configured, no signed APK generated. The owner has never manually compiled/signed an APK, so **do not ask them to search their PC for an imagined old private key**. GitHub debug-signing was ephemeral. The installed Galaxy A55 app and the .lwa test app are both versionCode 23, signed by debug certificate `8c8f61a96d2b4e636d61b916b353ef4eae5784ca84be0b68bfdc24156df76ec2`; that does not give access to the corresponding private key. New GitHub 1.6-LW debug builds have a different cert. **Do not uninstall or update them.**

The user has 8 valid JSON backups on H: RAID; all 8 were hash-compared to removable F: and passed, and the owner personally tested Restore of the 19:42 snapshot. No installation migration is authorized by this plan.

## What is and is not required from the owner

**All Android compilation, APK zip alignment, cryptographic APK signing and signature checks run on GitHub Actions.** The only one-time local step recommended is securely generating the permanent **identity keypairs** on a trusted computer (using an already available Java 17 `keytool`); this does **not** compile or sign an Android app. It makes sure the owner retains a private master instead of relying on a disposable runner. Repo source never contains any private key.

There are two signing identities:
- `trialum-release.p12` / alias `trialum-release`: only for future internal main-package signed candidates `com.trialum.ziivaiskra`; **CANNOT directly update the old debug-signed phone install.**
- `trialum-qa.p12` / alias `trialum-qa`: for the **new and independently installable** `com.trialum.ziivaiskra.signqa` signed QA app. The existing `com.trialum.ziivaiskra.lwa` and `.lw16` testers remain intact.

## Step A — Generate keypairs once, locally, no APK signing

From Windows **CMD**, ensure `H:` is the correct trusted private drive. Never put these files in the Git repository or in the game JSON backup folder.

```bat
mkdir "H:\Trialum-Key-Custody"
"C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot\bin\keytool.exe" -genkeypair -alias trialum-release -keyalg RSA -keysize 4096 -validity 10950 -storetype PKCS12 -keystore "H:\Trialum-Key-Custody\trialum-release.p12" -dname "CN=Trialum Release Signing, O=Trialum, C=MK"
"C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot\bin\keytool.exe" -genkeypair -alias trialum-qa -keyalg RSA -keysize 4096 -validity 10950 -storetype PKCS12 -keystore "H:\Trialum-Key-Custody\trialum-qa.p12" -dname "CN=Trialum Independent Signing QA, O=Trialum, C=MK"
```

The commands interactively ask for private passwords; **enter them only on the owner's computer** (do not send passwords via chat or command-line flags). PKCS12 typically uses one password per store/key; if so store the same value as STORE and KEY passwords in Actions. Keep two distinct strong passwords, one per keypair, in an independent password manager.

Inspect the **public** SHA-256 fingerprints without showing keys:

```bat
"C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot\bin\keytool.exe" -list -v -keystore "H:\Trialum-Key-Custody\trialum-release.p12" -storetype PKCS12 -alias trialum-release
"C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot\bin\keytool.exe" -list -v -keystore "H:\Trialum-Key-Custody\trialum-qa.p12" -storetype PKCS12 -alias trialum-qa
```

Look for `SHA256:` under **Certificate fingerprints**; remove colons and store the 64-digit hex values as the expected fingerprints in GitHub Variables (below).

Back up both encrypted `.p12` files to a separately protected, offline device. **Do not store passwords on the same offline media**, and verify the backups exist and can be opened using `keytool -list` on a disposable test setup. Do not rely solely on GitHub Secrets for key recovery.

## Step B — Put signing material ONLY in GitHub Secrets and public pins in Variables

Repo: `extreme4music-nexus/Trialum` (**private**). In GitHub open **Settings → Secrets and variables → Actions**.

Repository secrets — create **all six**:
| GitHub Secret | Content |
|---|---|
| `TRIALUM_RELEASE_KEYSTORE_B64` | Base64 of the complete `trialum-release.p12` binary |
| `TRIALUM_RELEASE_STORE_PASS` | Release keystore password |
| `TRIALUM_RELEASE_KEY_PASS` | Release key password (usually same for PKCS12) |
| `TRIALUM_QA_KEYSTORE_B64` | Base64 of the complete `trialum-qa.p12` binary |
| `TRIALUM_QA_STORE_PASS` | QA keystore password |
| `TRIALUM_QA_KEY_PASS` | QA key password (usually same for PKCS12) |

Encode one local file and put it directly into clipboard without echoing the Base64 on screen. Run in CMD, paste the value into the appropriate GitHub Secret entry, then clear the clipboard:

```bat
powershell -NoProfile -Command "[Convert]::ToBase64String([IO.File]::ReadAllBytes('H:\Trialum-Key-Custody\trialum-release.p12')) | Set-Clipboard"
```

Repeat for `trialum-qa.p12` and its own secret. The encoding is **not encryption**; GitHub Secrets encrypts the value as it is stored. Treat copied Base64 as sensitive, never put it in chat or issue comments. After GitHub entry, clear the local clipboard in PowerShell with `Set-Clipboard -Value ''`.

Repository variables (non-secret PUBLIC fingerprints):
| GitHub Variable | Content |
|---|---|
| `TRIALUM_RELEASE_CERT_SHA256` | Public release certificate SHA-256 (64 lowercase hex chars) |
| `TRIALUM_QA_CERT_SHA256` | Public QA certificate SHA-256 (64 lowercase hex chars) |

**GitHub plan warning:** for **private repositories**, GitHub environment secrets/protection features depend on the account plan. This workflow uses **repository-level Actions Secrets**, which must be protected operationally by tightly controlling write access, GitHub branch protection and GitHub Actions edits. Anyone able to change trusted workflow code on main could potentially misuse the secrets; this is not equivalent to hardware-backed signing. If GitHub Pro/Team private environment controls become available, move signing secrets to a protected Environment requiring independent approval.

## Step C — GitHub performs all build and signing steps

The merged [workflow](../.github/workflows/android-signing.yml) has:
1. Preflight: source regression tests, Gradle `assembleRelease` and `assembleSignqa` **without secret access**, verification of fixed app IDs, SDK 36/versionCode 24, non-debuggable APKs, bundled native/WebView game assets.
2. Only when **manually** invoked with `workflow_dispatch` on **`main` by repository owner `extreme4music-nexus`**, a second job reads the six secrets and two public certificate pins. Missing secrets or mismatch means **FAIL CLOSED**. Its private keystore files exist only in ephemeral runner storage, deleted by the job trap.
3. GitHub `zipalign` and official Android `apksigner` generate two separate signed APKs; re-verify v2 signature and exact pinned cert SHA-256, package and versionCode, output APK SHA-256 and non-secret source provenance.
4. GitHub Actions artifact: `Trialum-1.6-LW-OWNER-SIGNED-INTERNAL-ONLY`. **No automatic GitHub Release, Play upload, public URL, or Android device installation**. Treat this as development test candidates only.

**The default GitHub debug workflow stays unchanged.** If the signing workflow is triggered via PR or push, it runs *only* the unsigned preflight. It never signs on untrusted pull request code. Actual signing cannot be tested until the owner privately supplies the two keys and pins.

## Step D — Device acceptance before any change to installed apps

- Install/test the `com.trialum.ziivaiskra.signqa` package first. It is isolated from the original main and `.lwa`; do not install the newly signed main package over the installed debug-signed v1.5.6 app.
- Restore a **copy** of the verified JSON into new QA only, check achievements/habitats/XP/diary; confirm fail-closed invalid restore.
- Existing private local model binaries, Keystore-bound social identity and app-private rescue may not be inside JSON; don't imply that export alone recovers those.
- A future controlled plan for replacing the original debug-signed main package needs separate owner sign-off and data migration evidence. Do **not** uninstall to bypass Android signing mismatch.

## Current acceptance status

**SOURCE / CI PRE-FLIGHT PASS, merged into main.** Two permanent owner-custodied PKCS12 keys **NOT CREATED**; six GitHub Repository Secrets **NOT CONFIGURED**; two certificate SHA256 Repository Variables **NOT CONFIGURED**; permanent owner-controlled signed APK **NOT YET GENERATED**. The manual owner-only job must remain blocked until those inputs are supplied. The temporary CI rehearsal used a new disposable key that was deleted, not a distributable Trialum signing key. **LW-A sessions remain paused**.

References: [Master signing plan](TRIALUM_1.6_LW_ANDROID_SIGNING_MASTER_PLAN.md) · [owner device/backup evidence](TRIALUM_1.6_LW_SIGNING_PHASE1_EVIDENCE_20261110.md) · [Android official apksigner](https://developer.android.com/tools/apksigner) · [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).
