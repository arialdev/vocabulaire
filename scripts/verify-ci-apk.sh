#!/usr/bin/env bash
# Verify the APK's identity and signature, then create its checksum and build metadata.
set -Eeuo pipefail
apk=android/app/build/outputs/apk/release/app-release.apk
build_tools="$ANDROID_HOME/build-tools/37.0.0"
mkdir -p android-artifact
"$build_tools/aapt" dump badging "$apk" > android-artifact/badging.txt
grep -F "package: name='$CI_APP_ID'" android-artifact/badging.txt
if [[ -n "${CI_VERSION_NAME:-}" ]]; then
  grep -F "versionName='$CI_VERSION_NAME'" android-artifact/badging.txt
  grep -F "versionCode='$CI_VERSION_CODE'" android-artifact/badging.txt
fi
unzip -l "$apk" > android-artifact/apk-contents.txt
grep -q 'lib/arm64-v8a/' android-artifact/apk-contents.txt
grep -q 'lib/x86_64/' android-artifact/apk-contents.txt
"$build_tools/apksigner" verify --verbose --print-certs "$apk" > android-artifact/signature.txt
if [[ "$CI_APK_VARIANT" == release ]]; then
  test -n "${CI_CERT_SHA256:-}" || { echo 'Release certificate fingerprint is required'; exit 1; }
  grep -qx 'Number of signers: 1' android-artifact/signature.txt || { echo 'Expected exactly one APK signer'; exit 1; }
  actual=$(sed -nE 's/^(Signer #1|V[0-9.]+ Signer:) certificate SHA-256 digest: //p' android-artifact/signature.txt | tr '[:upper:]' '[:lower:]' | tr -d ':' | sort -u)
  expected=$(printf '%s' "$CI_CERT_SHA256" | tr '[:upper:]' '[:lower:]' | tr -d ':[:space:]')
  [[ "$actual" == "$expected" ]] || { echo 'Release certificate fingerprint does not match'; exit 1; }
fi
artifact_name="vocabulaire-$CI_APK_VARIANT.apk"
if [[ "$CI_APK_VARIANT" == preview && -n "${CI_VERSION_NAME:-}" ]]; then
  artifact_name="vocabulaire-preview-$CI_VERSION_NAME.apk"
fi
cp "$apk" "android-artifact/$artifact_name"
(cd android-artifact && sha256sum "$artifact_name" > SHA256SUMS)
fingerprint=$(sed -nE 's/^(Signer #1|V[0-9.]+ Signer:) certificate SHA-256 digest: //p' android-artifact/signature.txt | head -n 1)
printf 'commit=%s\npr_head=%s\nrun=%s\nrun_url=%s\nvariant=%s\nversion_name=%s\nversion_code=%s\napplication_id=%s\ncertificate_sha256=%s\n' \
  "${CI_SOURCE_SHA:-${GITHUB_SHA:-local}}" "${PR_HEAD_SHA:-}" "${GITHUB_RUN_ID:-local}" \
  "${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-local}/actions/runs/${GITHUB_RUN_ID:-local}" "$CI_APK_VARIANT" \
  "${CI_VERSION_NAME:-unknown}" "${CI_VERSION_CODE:-unknown}" "$CI_APP_ID" "$fingerprint" > android-artifact/build-info.txt
