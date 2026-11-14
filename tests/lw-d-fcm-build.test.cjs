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

test("GitHub auto-signs ONLY trusted owner LW-D SignQA with existing QA Secrets and certificate pin",()=>{
  const workflow=read(".github/workflows/lw-d-android-qa.yml");
  const existing=read(".github/workflows/android-signing.yml");
  assert.match(workflow,/sign-lw-d-signqa:/);
  assert.match(workflow,/needs: build-lwd-signqa/);
  assert.match(workflow,/github\.event_name == 'push'/);
  assert.match(workflow,/github\.ref == 'refs\/heads\/fix\/lw-d-fcm-lwd1-20261114'/);
  assert.match(workflow,/github\.actor == 'extreme4music-nexus'/);
  for(const credential of ["TRIALUM_QA_KEYSTORE_B64","TRIALUM_QA_STORE_PASS",
    "TRIALUM_QA_KEY_PASS","TRIALUM_QA_CERT_SHA256"])
      assert.ok(workflow.includes(credential),"Existing GitHub signing config not reused: "+credential);
  assert.match(workflow,/--ks-key-alias trialum-qa/);
  assert.match(workflow,/QA signing certificate SHA-256 mismatch/);
  assert.match(workflow,/Signer #1 certificate SHA-256 digest:/);
  assert.match(workflow,/OWNER_SIGNED_INTERNAL_LW_D_QA_NOT_PUBLIC_RELEASE/);
  assert.match(workflow,/Trialum-LW-D-L3-2A-OWNER-SIGNED-SIGNQA-/);
  assert.match(workflow,/package: name='com\.trialum\.ziivaiskra\.signqa'/);
  assert.doesNotMatch(workflow,/:app:assembleRelease|:app:assembleSigndebug/);
  assert.doesNotMatch(workflow,/RELEASE_KEYSTORE_B64|RELEASE_STORE_PASS|RELEASE_KEY_PASS/);
  assert.match(existing,/sign_one signqa unsigned-candidates\/trialum-signqa-UNSIGNED\.apk/);
  assert.match(workflow,/DO_NOT_UNINSTALL_OR_CLEAR_PREVIOUS_APP_DATA/);
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


test("Canonical LW-D contract must survive every next 3D phase and retain owner FCM PASS",()=>{
  const contract=read("docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md");
  const master=read("docs/TRIALUM_LIVING_WORLD_MASTER_3D_20261114.md");
  const lab=read("docs/LW_D_L3_LABORATORY_COMPLEX_20261114.md");
  const evidence=read("docs/LW_D_FCM_RESTORE_QA_PENDING_20261114.md");
  const workflow=read(".github/workflows/lw-d-android-qa.yml");
  const originalSigning=read(".github/workflows/android-signing.yml");
  for (const file of [master,lab]) {
    assert.match(file,/LW_D_CANONICAL_OPERATING_RULES_20261114\.md/);
    assert.match(file,/FCM OWNER PASS on 2026-11-14/);
  }
  for (const id of ["com.trialum.ziivaiskra","com.trialum.ziivaiskra.signdebug",
    "com.trialum.ziivaiskra.signqa"]) assert.ok(contract.includes(id));
  assert.match(contract,/Never invent a fourth Firebase Android app/);
  assert.match(contract,/NEVER tell owner to sign locally/);
  assert.match(contract,/FCM real-device acceptance achieved 2026-11-14/);
  assert.match(evidence,/FCM OWNER PASS/);
  assert.match(evidence,/Работи ФЦМ сега/);
  for (const existing of ["TRIALUM_FIREBASE_APP_ID_SIGNQA",
    "TRIALUM_QA_KEYSTORE_B64","TRIALUM_QA_STORE_PASS",
    "TRIALUM_QA_KEY_PASS","TRIALUM_QA_CERT_SHA256"]) {
    assert.ok(workflow.includes(existing),"LW-D lost existing GitHub config "+existing);
  }
  assert.match(workflow,/:app:assembleSignqa/);
  assert.match(workflow,/sign-lw-d-signqa:/);
  assert.match(workflow,/github\.actor == 'extreme4music-nexus'/);
  assert.match(originalSigning,/sign_one signqa/);
  assert.doesNotMatch(workflow,/TRIALUM_FIREBASE_APP_ID_LWD1/);
  assert.doesNotMatch(workflow,/:app:assembleRelease|:app:assembleSigndebug/);
});
