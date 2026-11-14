"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");

test("LWD1 must have its own Firebase Android App ID, not inherit Release", () => {
  const gradle = read("android-template/app/build.gradle.kts");
  const part = gradle.split('create("lwd1")')[1]?.split('create("signqa")')[0];
  assert.ok(part, "Missing isolated LWD1 build type");
  assert.match(part, /applicationIdSuffix = "\.lwd1"/);
  assert.match(part, /trialumFirebaseAppIdLwd1/);
  assert.match(part, /lwdAppId != releaseAppId/);
  assert.match(part, /lwdAppId != signqaAppId/);
  assert.match(part, /lwdAppId != signdebugAppId/);
  assert.match(part, /lwdAppId\.startsWith\("1:\$senderId:android:"\)/);
  assert.match(part, /resValue\("string", "trialum_firebase_app_id", lwdAppId\)/);
});

test("FCM and Friends must be embedded in the standalone LWD1 APK and verified", () => {
  const workflow = read(".github/workflows/lw-d-android-qa.yml");
  for (const key of [
    "TRIALUM_SOCIAL_API_URL",
    "TRIALUM_FIREBASE_APP_ID",
    "TRIALUM_FIREBASE_APP_ID_SIGNQA",
    "TRIALUM_FIREBASE_APP_ID_SIGNDEBUG",
    "TRIALUM_FIREBASE_APP_ID_LWD1",
    "TRIALUM_FIREBASE_SENDER_ID",
    "TRIALUM_FIREBASE_PROJECT_ID",
    "TRIALUM_FIREBASE_API_KEY"
  ]) {
    assert.ok(workflow.includes("vars." + key), "Missing workflow Firebase variable: " + key);
    assert.ok(workflow.includes(key), "Missing validation for " + key);
  }
  assert.match(workflow, /-PtrialumFirebaseAppIdLwd1=\$TRIALUM_FIREBASE_APP_ID_LWD1/);
  assert.match(workflow, /-PtrialumSocialApiUrl=\$social_url/);
  assert.match(workflow, /dump --values resources/);
  assert.match(workflow, /grep -Fq "\$TRIALUM_FIREBASE_APP_ID_LWD1"/);
  assert.match(workflow, /grep -Fq "\$\{TRIALUM_SOCIAL_API_URL%\/\}"/);
  assert.match(workflow, /::error::Missing Actions Variable/);
});

test("All LW-D APK signing happens locally; no CI debug signer or owner key", () => {
  const gradle = read("android-template/app/build.gradle.kts");
  const part = gradle.split('create("lwd1")')[1]?.split('create("signqa")')[0];
  const workflow = read(".github/workflows/lw-d-android-qa.yml");
  assert.match(part, /signingConfig = null/);
  assert.match(workflow, /if "\$tools_path\/apksigner" verify "\$source_apk"/);
  assert.match(workflow, /FCM-UNSIGNED\.apk/);
  assert.match(workflow, /LOCAL_OWNER_ONLY_REQUIRED/);
  assert.doesNotMatch(workflow, /apksigner sign|keytool -genkeypair|ANDROID_SIGNING_KEY/);
  assert.match(workflow, /DO_NOT_UNINSTALL_OR_CLEAR_EXISTING_APP_DATA/);
});

test("Core social/AI/FCM delivery remain opt-in and original world stays intact", () => {
  const push = read("android-template/app/src/main/java/com/trialum/ziivaiskra/TrialumPush.kt");
  const service = read("android-template/app/src/main/java/com/trialum/ziivaiskra/TrialumFirebaseService.kt");
  const server = read("server/src/push.mjs");
  const ai = read("js/playground-ai.js");
  assert.match(push, /if \(!configured\(activity\)\)/);
  assert.match(push, /explicit_consent/);
  assert.match(push, /SocialCredentialVault/);
  assert.match(service, /TrialumPush\.notifyGeneric/);
  assert.match(server, /trialum_friends_optin/);
  assert.match(ai, /TrialumDialogueSessions/);
});
