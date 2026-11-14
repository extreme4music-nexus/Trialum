"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");

test("LW-D reuses registered SignQA package and its distinct Firebase App ID",()=>{
  const gradle=read("android-template/app/build.gradle.kts");
  const qa=gradle.split('create("signqa")')[1]?.split('create("signdebug")')[0];
  assert.ok(qa,"Existing SignQA build type missing");
  assert.match(qa,/applicationIdSuffix = "\.signqa"/);
  assert.match(qa,/trialumFirebaseAppIdSignqa/);
  assert.match(qa,/qaAppId != releaseAppId/);
  assert.match(qa,/resValue\("string", "trialum_firebase_app_id", qaAppId\)/);
  assert.doesNotMatch(gradle,/trialumFirebaseAppIdLwd1/,"Never invent a fourth Firebase registration");
});

test("LW-D workflow uses existing SignQA Firebase variables and compiles ONLY SignQA",()=>{
  const workflow=read(".github/workflows/lw-d-android-qa.yml");
  for(const key of ["TRIALUM_SOCIAL_API_URL","TRIALUM_FIREBASE_APP_ID",
    "TRIALUM_FIREBASE_APP_ID_SIGNQA","TRIALUM_FIREBASE_APP_ID_SIGNDEBUG",
    "TRIALUM_FIREBASE_SENDER_ID","TRIALUM_FIREBASE_PROJECT_ID","TRIALUM_FIREBASE_API_KEY"]){
    assert.ok(workflow.includes("vars."+key),"Missing pre-existing variable: "+key);
  }
  assert.match(workflow, /-PtrialumFirebaseAppIdSignqa=\$TRIALUM_FIREBASE_APP_ID_SIGNQA/);
  assert.match(workflow, /-PtrialumSocialApiUrl=\$social_url/);
  assert.match(workflow, /:app:assembleSignqa/);
  assert.doesNotMatch(workflow, /:app:assembleRelease|:app:assembleSigndebug|:app:assembleLwd1/);
  assert.doesNotMatch(workflow, /TRIALUM_FIREBASE_APP_ID_LWD1/);
  assert.match(workflow, /dump --values resources/);
  assert.match(workflow, /grep -Fq "\$expected"/);
  assert.match(workflow, /package: name='com\.trialum\.ziivaiskra\.signqa'/);
});

test("Owner signs LW-D SignQA only LOCALLY; Codex Release/FriendsDebug untouched",()=>{
  const workflow=read(".github/workflows/lw-d-android-qa.yml");
  const helper=read("scripts/sign-lw-d-signqa-local.sh");
  assert.match(workflow,/SIGNQA-UNSIGNED\.apk/);
  assert.match(workflow,/OWNER_QA_KEY_LOCAL_ONLY/);
  assert.match(workflow,/apksigner" verify "\$source_apk"/);
  assert.doesNotMatch(workflow,/apksigner sign|keytool -genkeypair|secrets\.|ANDROID_SIGNING_KEY/);
  assert.match(helper,/package: name='com\.trialum\.ziivaiskra\.signqa'/);
  assert.match(helper,/apksigner sign/);
  assert.doesNotMatch(helper,/com\.trialum\.ziivaiskra\.lwd1/);
  assert.match(workflow,/DO_NOT_UNINSTALL_OR_CLEAR_ANY_TRIALUM_DATA/);
});

test("SignQA gets LW-D immersive 3D without altering Codex Release or FriendsDebug",()=>{
  const native=read("android-template/app/src/main/java/com/trialum/ziivaiskra/MainActivity.kt");
  assert.match(native,/private fun isLivingWorldQaPackage\(\)/);
  assert.match(native,/packageName == "com\.trialum\.ziivaiskra\.signqa"/);
  assert.match(native,/packageName == "com\.trialum\.ziivaiskra\.lwd1"/);
  assert.match(native,/if \(!isLivingWorldQaPackage\(\)\) return/);
  assert.match(native,/if \(isLivingWorldQaPackage\(\) &&/);
  const push=read("android-template/app/src/main/java/com/trialum/ziivaiskra/TrialumPush.kt");
  const ai=read("js/playground-ai.js");
  assert.match(push,/explicit_consent/);
  assert.match(ai,/TrialumDialogueSessions/);
});
