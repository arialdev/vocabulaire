#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p android-diagnostics/maestro
capture_diagnostics() {
  local status=$?
  trap - EXIT
  adb logcat -d -v threadtime > android-diagnostics/logcat.txt 2>&1 || true
  adb shell uiautomator dump /sdcard/window.xml > android-diagnostics/hierarchy-command.txt 2>&1 || true
  adb pull /sdcard/window.xml android-diagnostics/window.xml > /dev/null 2>&1 || true
  adb exec-out screencap -p > android-diagnostics/screen.png 2>/dev/null || true
  exit "$status"
}
trap capture_diagnostics EXIT
adb install android/app/build/outputs/apk/release/app-release.apk
maestro test --debug-output android-diagnostics/maestro --format JUNIT --output android-diagnostics/maestro.xml -e "APP_ID=$CI_APP_ID" .maestro/first-collection.yaml 2>&1 | tee android-diagnostics/maestro.log
