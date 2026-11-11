## Why

Both attempts of [PR #16's Android job](https://github.com/arialdev/vocabulaire/actions/runs/43105821564) built and verified the preview APK, then failed when Maestro lost its connection to the emulator. The required check blocked the PR and the workflow skipped APK upload in both attempts.

## What Changes

- End the required Android job with APK verification and upload on pull requests and on `main`. Keep the existing `checks` and `android` job names.
- Remove hosted emulator and Maestro execution from automatic CI. Keep the existing Maestro flows available for local Android acceptance.
- Make the Jest step propagate a failed test exit status through its log pipeline while retaining available output and coverage.
- Document what hosted CI verifies and how to run native acceptance locally on a disposable Android device or emulator.

## Capabilities

### New Capabilities

### Modified Capabilities

- `android-ci` moves device testing out of the required workflow, retains verified preview and release APK delivery, and makes Jest failures block CI.

## Impact

The change affects the GitHub Actions pipeline, its emulator-only helper and related tests, and the README. Automatic checks cover the build, APK metadata, and Jest coverage. Runtime coverage, including first-run navigation and persistence after restart, depends on running the existing Android flows locally.
