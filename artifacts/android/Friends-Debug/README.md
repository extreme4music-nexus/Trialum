# Trialum Friends Debug

**Owner-only debuggable Android test application** `com.trialum.ziivaiskra.signdebug`. Its APK is signed with the **same permanent QA key/certificate** as [Signing QA](../Signing-QA/README.md), not with a transient Android debug key.

GitHub Actions deposits `Trialum-signdebug.apk` and `provenance.txt` here **only after cryptographic/package/Friends endpoint checks pass**. This is a separate Android package, storage sandbox, secure social identity and invite scheme; use it as a second independent tester on the same phone.

This app deliberately has Android `debuggable=true`. Never treat it as a public release or use production/private keys in it. Do not rename it to the existing main package or install it over the historical `.lwa`/`.lw16` test applications.
