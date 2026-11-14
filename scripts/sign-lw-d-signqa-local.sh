#!/usr/bin/env bash
# Trialum LW-D existing Signing QA identity: LOCAL signing only. Never upload keystores or passwords.
set -euo pipefail
umask 077

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <GitHub-UNSIGNED.apk> <LOCAL-QA.keystore> <key-alias> <signed-output.apk>" >&2
  echo "Requires local Android SDK build-tools (zipalign, apksigner, aapt) in PATH." >&2
  exit 2
fi
input="$1"
keystore="$2"
alias="$3"
output="$4"
test -s "$input" || { echo "Missing unsigned input APK" >&2; exit 1; }
test -f "$keystore" || { echo "Missing LOCAL keystore (never download it from GitHub)" >&2; exit 1; }
for bin in zipalign apksigner aapt; do
  command -v "$bin" >/dev/null || { echo "Missing local Android build tool: $bin" >&2; exit 1; }
done
if [ "$input" = "$output" ]; then
  echo "Refusing to overwrite unsigned provenance APK" >&2
  exit 1
fi
aapt dump badging "$input" | grep -Fq "package: name='com.trialum.ziivaiskra.signqa'" || {
  echo "Wrong package: this tool ONLY signs the existing SignQA QA app" >&2
  exit 1
}
if apksigner verify "$input" >/dev/null 2>&1; then
  echo "Input already signed. Refusing to resign an unknown APK." >&2
  exit 1
fi
temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT
zipalign -f -p 4 "$input" "$temp/aligned.apk"
zipalign -c -p 4 "$temp/aligned.apk"
# Android build tools prompt locally for any missing keystore passwords.
# No passwords, keys, Firebase service credentials or tokens on GitHub.
apksigner sign --ks "$keystore" --ks-key-alias "$alias" \
  --out "$output" "$temp/aligned.apk"
apksigner verify --verbose --print-certs "$output"
sha256sum "$output"
echo "Locally signed LW-D SignQA candidate. Do NOT uninstall an existing app to bypass signer mismatch."
