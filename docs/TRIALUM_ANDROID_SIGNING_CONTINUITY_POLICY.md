# Trialum Android — mandatory signing identity continuity

**Owner directive, 11 November 2026:** From now on **every Android APK delivered to the owner for installation must be signed in GitHub Actions with a permanent owner-held key.** Do **not** distribute GitHub-runner debug-signed, unsigned or per-run ad hoc signed builds as installable Trialum updates. This is a **release/installation gate**, not a request to modify game worlds or existing installed packages.

## Immutable signer by Android application ID

Android enforces signer continuity for **updates to the same package ID**. Using the same name/logo/code is not enough: each future version must present a signing certificate compatible with the already installed version. The signature bytes of two different APK files are not identical; **the signing certificate identity (SHA-256 fingerprint) is what must remain stable.**

| Future installable Android package | Owner-held signing key and alias | Pinned cert SHA-256 | Update policy |
|---|---|---|---|
| `com.trialum.ziivaiskra` | `trialum-release` (Release PKCS12) | `d8e646b45fcfeb68ec044bfa65157200c0d6962df6e81e97d54ce448f8af1a67` | **ALWAYS** sign with this same identity for future owner-signed main releases |
| `com.trialum.ziivaiskra.signqa` | `trialum-qa` (QA PKCS12) | `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c` | **ALWAYS** sign with this same identity for future Signing QA updates |
| `com.trialum.ziivaiskra.signdebug` | **Same** `trialum-qa` (QA PKCS12) | **Same** `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c` | Separate debuggable Friends test companion; stable QA signature for every future update |

**Two owner-held keys are deliberate:** Release and SignQA have **different permanent certificates**, as already implemented and verified on GitHub run [#42924886058](https://github.com/extreme4music-nexus/Trialum/actions/runs/42924886058). "Same signature" means the **same pinned signer for each app across its versions**, not necessarily the same certificate for *different* Android package IDs. Changing either identity in the future is **BLOCKED** without a separately approved migration plan, not an ordinary signing convenience.

**Legacy packages:** The previously installed main version `1.5.6-rc1` and historical `com.trialum.ziivaiskra.lwa` were signed using an unrecoverable/undemonstrated runner debug private key corresponding to certificate `8c8f61a96d2b4e636d61b916b353ef4eae5784ca84be0b68bfdc24156df76ec2`. The stable Release signer **cannot overwrite that installed main app in place**. Historical `.lwa` and `.lw16` debug packages remain preserved, but new APKs for those identities **must not be published or recommended for updating** unless a separately safe signer/migration solution is approved. **Do not uninstall / clear storage to work around certificate mismatch.**

## Owner-authorized automated GitHub signing and desktop artifact sync — 11 November 2026

**Owner explicitly authorizes ChatGPT/its connected GitHub tools to handle the repository workflows, source changes and approved builds without asking the owner to click Run workflow each time.** The operational implementation is **automatic GitHub Actions on trusted source merges/pushes to `main`**. There is no general external GitHub workflow-dispatch command exposed to this assistant; automation removes the need for manual dispatch. Owner-only manual dispatch remains available if needed. **This permission does not authorize exposing keys, deleting worlds/backups, changing the home social server or publishing to stores.**

- After main receives a relevant source/workflow change, `.github/workflows/android-signing.yml` runs full preflight then signs all three Android candidates with the **existing** immutable owner-held Release/QA certificate pins. Pull requests and feature branches cannot access private signing Secrets, sign installable APKs or publish them.
- After successful signing, an **independent no-private-key publish job** downloads the signed internal Actions artifact, verifies three APK SHA-256s, the public certificate pins and package identities, then commits the latest three APKs to the private Git repository under `artifacts/android/Release/`, `artifacts/android/Signing-QA/` and `artifacts/android/Friends-Debug/`.
- GitHub Actions `contents:write` applies only to that separate publish job; signing jobs retain read-only repository access. The publisher refuses to overwrite a newer `main` commit with stale APKs. Binary-only Git commits are `[skip ci]` and excluded from the signing trigger to avoid recursion.
- Clone or `git pull origin main` on the owner's desktop now syncs the latest **already verified signed** Android APKs and their `provenance.txt` files. Separate `artifacts/windows/` and `artifacts/ios/` folders are placeholders only.
- Private Git binary commits increase clone/history size even if only the newest APK appears in the current tree; monitor repository size, evaluate Git LFS or permanent Releases if the growth becomes costly. No public release is authorized.
- If the repository's branch protection or Actions token write restrictions prevent an automated binary commit, **do not weaken branch protection silently**. The signed Actions ZIP remains independently available; document the limitation and use an approved alternate publishing route.

## Enforced GitHub behavior

1. `.github/workflows/build-android.yml` remains as automatic CI source/manifest/regression verification. It may compile ephemeral debug APKs **within the disposable CI runner for testing only**, but **MUST NOT upload debug APK artifacts** for installation. Preview images remain allowed.
2. `.github/workflows/android-signing.yml` is the **only artifact-producing path for installable APKs**. A manually dispatched `workflow_dispatch` must originate from the trusted owner account and `main`; trusted `push` events on `main` are automatically signed. All compiled unsigned candidates first undergo JS regressions, package ID and manifest checks. **Unsigned intermediate APK artifacts can be transferred only for a trusted main push or owner-manual signing job**, labeled `DO-NOT-INSTALL` with 1-day retention; never publish them on PR/push.
3. Release and SignQA are signed using encrypted GitHub Repository Secrets, owner-held PKCS12 identities and aliases. Before an installable artifact can upload, GitHub's `apksigner verify` **must match the pinned SHA-256 certificate** from repository Variables, check v2 signature, package ID and version code, and calculate/store APK SHA-256. Missing/wrong secrets, invalid certificates or unexpected package IDs **FAIL CLOSED**.
4. On *every* future APK version update: preserve the certificate and package ID; advance `versionCode` monotonically; adapt any exact-version CI assertions deliberately; run signing workflow; record exact source SHA, APK SHA-256, certificate SHA-256 and owner-device update/restore acceptance. Never regenerate release/QA keys because a certificate expiry, password change or temporary CI error is inconvenient.
5. No automatic GitHub Releases/Google Play submissions, no distribution of raw unsigned/debug APKs and no unapproved update to the phone. If a new Android package identity is ever introduced, explicitly assign it a **permanent owner-held signer before distributing its first build**.

## Acceptance / known limits

- **Proven:** GitHub owner-only run #42924886058 signed and verified both Release and SignQA APKs with the pinned certificates; 8/8 verified game backups are on RAID/USB; owner separately reported initial SignQA success without full itemized save/restore acceptance.
- **Still required:** Android device SignQA + copied-world Restore audit, preserve old main/LW-A stores; LW-A session lifecycle/expiry implementation and independent acceptance. Public/Play release remains on hold.
- If asked whether **all APK files have literally the same certificate**: **NO**, Release and Signing QA intentionally have different fixed certificates. They both belong to the owner, and **each maintains the same certificate across subsequent updates**. Do not misstate this to the owner.

See [signing setup evidence](TRIALUM_1.6_LW_GITHUB_SIGNING_SETUP.md) and [next-day handoff](TRIALUM_1.6_LW_HANDOFF_2026-11-11.md).
