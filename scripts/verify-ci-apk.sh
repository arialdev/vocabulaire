#!/usr/bin/env bash
set -Eeuo pipefail
apk=android/app/build/outputs/apk/release/app-release.apk
build_tools="$ANDROID_HOME/build-tools/37.0.0"
mkdir -p android-artifact
"$build_tools/aapt" dump badging "$apk" > android-artifact/badging.txt
grep -F "package: name='$CI_APP_ID'" android-artifact/badging.txt
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
cp "$apk" "android-artifact/vocabulaire-$CI_APK_VARIANT.apk"
(cd android-artifact && sha256sum "vocabulaire-$CI_APK_VARIANT.apk" > SHA256SUMS)
printf 'commit=%s\nrun=%s\nvariant=%s\n' "${GITHUB_SHA:-local}" "${GITHUB_RUN_ID:-local}" "$CI_APK_VARIANT" > android-artifact/build-info.txt
