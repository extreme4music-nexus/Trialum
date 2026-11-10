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
assert(!/releaseW+upload-release-asset/.test(y),'Do not publish unsigned or signed apps to GitHub Releases');
console.log('SIGNING PREFLIGHT PASS: signing stays on GitHub; package identity and saved worlds protected.');
