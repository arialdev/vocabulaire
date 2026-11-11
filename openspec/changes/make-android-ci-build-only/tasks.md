## 1. Workflow and cleanup

- [x] 1.1 Keep `checks` and `android` on the existing PR and `main` triggers. Remove Maestro setup, KVM, emulator execution, and emulator diagnostics from `android`. Keep APK upload gated on a successful build and verification, with the existing preview and release signing paths, ABIs, metadata, and retention.
- [x] 1.2 Set `shell: bash` on the Jest and coverage step. Keep the upload of available logs and coverage after a failure.
- [x] 1.3 Confirm there are no remaining callers, then remove `scripts/ci-android-smoke.sh` and `__tests__/ci-android-smoke.test.cjs`. Keep the local `.maestro/` flows and fixtures.

## 2. Documentation

- [x] 2.1 Update the README to describe the required CI checks, preview and release artifacts, seven-day retention, and local Android acceptance. Include how to target the preview package on a disposable device or emulator.

## 3. Verification

- [x] 3.1 Run lint, format check, typecheck, and Jest with coverage. Exercise the Jest logging command with a deliberately failing test in an isolated copy and confirm it exits nonzero while writing the log.
- [ ] 3.2 Verify a hosted PR run reports both required checks and uploads the preview APK after static verification. Download it and inspect the checksum, preview package ID, ABIs, and signature. Record the run and artifact.
- [ ] 3.3 Verify the first trusted `main` run checks the configured production certificate and uploads the signed APK and its metadata. Record the run and artifact when available.
