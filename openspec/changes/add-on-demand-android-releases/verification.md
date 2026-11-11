# Verification

Local checks completed for the CI changes:

- `actionlint` 1.7.12 passed on `pipeline.yml`.
- `bash -n scripts/verify-ci-apk.sh`, `git diff --check`, and strict OpenSpec validation passed.
- Lint, format check, typecheck, and Jest passed. Jest reported 31 suites and 98 tests passing.
- Temporary git-cliff 2.14.2 fixture repositories verified the first version, patch, minor, major, maintenance-only and breaking-maintenance cases, plus release notes across a beta tag.
- After including maintenance commits, separate fixtures confirmed that `build`, `chore`, `ci`, `docs`, `style`, `test`, and `refactor` commits appear under Other changes and trigger a patch bump. A breaking documentation commit triggered a major bump.
- A temporary APK verification fixture checked metadata extraction and rejected an incorrect version name.

The application checks used `MISE_AUTO_INSTALL=0` because this sandbox cannot install the new git-cliff tool into mise's global installation directory. Git-cliff was run from a downloaded release binary in a temporary directory. Hosted GitHub Actions, a signed Android APK, and emulator behavior remain to be verified.
