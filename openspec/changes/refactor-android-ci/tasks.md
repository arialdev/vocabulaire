## 1. Diagnose Android smoke failures

- [x] 1.1 Reproduce the hosted 320×640 emulator scenario on a disposable Android emulator; collect hierarchy, screenshots and logcat, and establish why Save was missing.
- [x] 1.2 Fix the smoke flow or application as evidence warrants, retaining creation and restart-persistence assertions; follow Stitch requirements if UI changes are necessary.
- [ ] 1.3 Investigate the separate launch-stage failure using captured diagnostics and address any confirmed cause without masking failures.

## 2. CI checks and diagnostics

- [x] 2.1 Refactor PR-to-main and main-push triggers and shared pinned-toolchain checks, with minimal permissions and no release secrets in PR jobs.
- [x] 2.2 Preserve Jest output and coverage as bounded-retention artifacts, including available outputs on failure and original exit statuses.
- [x] 2.3 Configure emulator diagnostics, including Maestro logs, screenshots, hierarchy and logcat before shutdown; upload on failure without masking the smoke result.
- [x] 2.4 Remove SonarCloud workflow configuration, project properties and stale current documentation while retaining Oxlint and coverage.

## 3. Android artifacts and signing

- [x] 3.1 Configure a standalone test-signed preview with a distinct app ID and phone-compatible ABI; parameterize affected Maestro flows and verify emulator compatibility.
- [x] 3.2 Configure persistent release signing through protected main-only credentials and Expo-prebuild-compatible configuration; fail clearly when credentials are absent.
- [x] 3.3 Upload identifiable preview and release APKs with bounded retention; verify APK package, ABI, signature and checksum, and ensure no debug fallback is published as a release.
- [x] 3.4 Document owner setup for the keystore, backup, secrets, version codes, artifact retention and zero-spend settings, including future Play signing considerations.

## 4. Verification and handoff

- [x] 4.1 Run lint, format check, typecheck and Jest coverage locally; record results and test output.
- [x] 4.2 Exercise the affected Maestro flow on a disposable emulator, including the small screen and the actual preview app ID; record diagnostics and results.
- [x] 4.3 Rehearse applicable workflow jobs with act if Docker is available, documenting emulator and hosted-service differences.
- [ ] 4.4 Verify real hosted PR and main runs, artifact downloads, diagnostics on a controlled failure, and release signing with owner-provided credentials; record limitations and results.
- [x] 4.5 Update README, compatibility notes and OpenSpec evidence with setup, verification and outstanding platform limits.
