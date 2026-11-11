'use strict';
/* Preflight for a NEW independently installable QA package. No signing keys are read. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const g=fs.readFileSync('android-template/app/build.gradle.kts','utf8');
const q=fs.readFileSync('android-template/app/src/signqa/res/values/trialum_app_labels.xml','utf8');
const d=fs.readFileSync('android-template/app/src/signdebug/res/values/trialum_app_labels.xml','utf8');
for(const s of ['create("signqa")','initWith(getByName("release"))','applicationIdSuffix = ".signqa"','versionNameSuffix = "-signqa"','isDebuggable = false','trialum-signqa']) {
  assert(g.includes(s),'Missing signed QA separation: '+s);
}
for(const s of ['create("lwa")','create("lw16")','versionCode = 25','versionName = "1.6-LW-dev.2"']) {
  assert(g.includes(s),'Historical or current QA configuration removed: '+s);
}
assert(q.includes('<string name="trialum_app_label">Trialum Signing QA</string>'));
assert(q.includes('<string name="trialum_invite_scheme">trialum-signqa</string>'));
for(const x of ['create("signdebug")','initWith(getByName("release"))','applicationIdSuffix = ".signdebug"','versionNameSuffix = "-signdebug"','isDebuggable = true','trialum-signdebug']) {
  assert(g.includes(x), 'Missing owner-signed Friends Debug package: '+x);
}
assert(d.includes('<string name="trialum_app_label">Trialum Friends Debug</string>'));
assert(d.includes('<string name="trialum_invite_scheme">trialum-signdebug</string>'));
assert(!g.includes('applicationIdSuffix = ".debug"'), 'Never reuse historical main debug package ID');
assert(!g.includes('TRIALUM_RELEASE_STORE_PASS'),'Never place signing credentials or release signing logic in Gradle source');
const y=fs.readFileSync('.github/workflows/android-signing.yml','utf8');
assert(y.includes('workflow_dispatch:'));
assert(y.includes("github.ref == 'refs/heads/main'"));
assert(y.includes('TRIALUM_RELEASE_KEYSTORE_B64'));
assert(y.includes('TRIALUM_QA_KEYSTORE_B64'));
assert(y.includes('apksigner'));
assert(y.includes("github.actor == 'extreme4music-nexus'"), 'Manual signing must be owner-only on main');
assert(y.includes('RELEASE_CERT_SHA256') && y.includes('QA_CERT_SHA256'), 'Both signing certificates must be pinned');
assert(y.includes('Signer #1 certificate SHA-256 digest:'), 'Signed artifact must be checked against its public cert pin');
assert(y.includes('sign_one release') && y.includes('sign_one signqa') && y.includes('sign_one signdebug'),
  'All three owner-signed APK families must be generated together');
assert(y.includes('for variant in release signqa signdebug; do'),
  'Check manifest/package and Friends backend URL for all three APKs');
assert(y.includes('assembleRelease :app:assembleSignqa :app:assembleSigndebug'),
  'Release, QA and Friends Debug must compile from the same source');
assert(y.includes('com.trialum.ziivaiskra.signdebug 1.6-LW-dev.2-signdebug "$work/qa.p12"') &&
  y.includes('trialum-qa "$QA_CERT_SHA256" QA_STORE_PASS QA_KEY_PASS true'),
  'Friends Debug MUST share fixed QA private key and SHA256 pin, not Release or transient debug signer');
assert(y.includes('trialum-qa "$QA_CERT_SHA256" QA_STORE_PASS QA_KEY_PASS false'),
  'Existing Signing QA must retain the same permanent signer');
assert(y.includes('if [ "$expects_debug" = true ]; then') &&
  y.includes('elif [ "$expects_debug" = false ]; then'),
  'Require debuggable only for Friends Debug and reject it for Release and Signing QA');
assert(y.includes("versionCode='25'") && y.includes('version_code=25'),
  'Increment package versionCode for existing QA updates (never reuse v24)');


// Friends regression: the signed build (not just the historical debug APK)
// must carry the user-configured HTTPS endpoint into the native Android
// string resource for BOTH the Release and SignQA APK variants.
assert(y.includes('TRIALUM_SOCIAL_API_URL: ${{ vars.TRIALUM_SOCIAL_API_URL }}'),
  'Owner signing workflow lost Friends server variable');
assert(y.includes('"-PtrialumSocialApiUrl=$social_url"'),
  'Owner signing workflow did not pass Friends HTTPS endpoint to Gradle');
assert(y.includes('GitHub Actions Variable TRIALUM_SOCIAL_API_URL is required'),
  'Owner signing must fail closed rather than publish an offline-looking Friends APK');
assert(y.includes('dump --values resources') &&
  y.includes('grep -Fq "$social_url"'),
  'Both compiled APKs must be checked for embedded Friends URL before signing');
assert(y.includes('TRIALUM_FIREBASE_APP_ID: ${{ vars.TRIALUM_FIREBASE_APP_ID }}'),
  'Signed builds should not discard previously supported opt-in Firebase config');
assert(g.includes('resValue("string", "trialum_social_api_url", socialApiUrl)'),
  'Native Android resource for Friends server must remain configured');

// The older CI workflow must NEVER publish runner-generated Android debug APKs.
// This is the regression guard against installation/update failures caused by
// a new debug certificate on each GitHub-hosted build.
const oldCi = fs.readFileSync('.github/workflows/build-android.yml','utf8');
assert(!/path:\s*android-template\/app\/build\/outputs\/apk\//.test(oldCi),
  'Never publish a temporary debug APK from legacy CI; use pinned GitHub signing instead');
assert(!oldCi.includes('name: Trialum-Android-1.6-LW-dev-debug'),
  'Legacy debug artifact name must not be distributable');
assert(!oldCi.includes('name: Trialum-1.6-LW-Isolated-Test-APK'),
  'Legacy .lw16 debug artifact must not be distributable');
const ownerOnlyHandoff = "if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main' && github.actor == 'extreme4music-nexus'";
assert(y.includes('Store UNSIGNED candidates for same-run signing only\n        '+ownerOnlyHandoff),
  'Unsigned APK handoff must be strictly internal to owner-only main dispatch');
assert((y.match(/name: trialum-internal-unsigned-builds-DO-NOT-INSTALL/g)||[]).length===2,
  'Internal unsigned APK handoff producer/consumer must use the same name');
assert(!/release\W+upload-release-asset/.test(y),'Never auto-publish APK to GitHub Releases');
console.log('SIGNING PREFLIGHT PASS: signing stays on GitHub; package identity and saved worlds protected.');
