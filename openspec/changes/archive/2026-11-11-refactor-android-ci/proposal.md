## Why

Recent main-branch CI runs pass Jest but fail the Android smoke test, and missing failure artifacts prevent reliable diagnosis. The existing workflow does not provide phone-installable PR previews or production-signed release APKs.

## What Changes

- Refactor GitHub Actions for pull requests targeting main and pushes to main, preserving pinned toolchain checks and Android verification.
- Diagnose and fix the hosted Maestro failures, retain meaningful end-to-end assertions, and collect failure diagnostics.
- Publish a separately identified, test-signed standalone PR preview APK and a release-signed main APK, alongside test results and coverage.
- Remove the SonarCloud integration while retaining Oxlint and test coverage.
- Document local and hosted verification, signing setup, artifact retention, and zero-cost operating constraints.

## Capabilities

### New Capabilities

- `android-ci`: Android CI triggers, checks, signing, artifacts, and diagnostic requirements.

### Modified Capabilities

None.

## Impact

GitHub Actions workflows, Maestro flows, signing configuration, and project documentation are affected. Existing Expo prebuild, Gradle, Jest, Maestro, and GitHub-hosted standard runners remain in use; no hosted build service or new dependency is required. Release signing requires owner-provided credentials and protected GitHub configuration.
