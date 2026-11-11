'use strict';
/* Preflight for a NEW independently installable QA package. No signing keys are read. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const g=fs.readFileSync('android-template/app/build.gradle.kts','utf8');
const q=fs.readFileSync('android-template/app/src/signqa/res/values/trialum_app_labels.xml','utf8');
for(const s of ['create("signqa")','initWith(getByName("release"))','applicationIdSuffix = ".signqa"','versionNameSuffix = "-signqa"','isDebuggable = false','trialum-signqa']) {
  assert(g.includes(s),'Missing signed QA separation: '+s);
}
for(const s of ['create("lwa")','create("lw16")','versionCode = 24','versionName = "1.6-LW-dev.1"']) {
  assert(g.includes(s),'Historical or current QA configuration removed: '+s);
}
assert(q.includes('<string name="trialum_app_label">Trialum Signing QA</string>'));
assert(q.includes('<string name="trialum_invite_scheme">trialum-signqa</string>'));
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
assert(y.includes('sign_one release') && y.includes('sign_one signqa'), 'Both owner-signed installable APK families must remain present');
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
