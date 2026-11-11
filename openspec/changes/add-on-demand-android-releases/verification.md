# Verification

Local checks completed for the CI changes:

- `actionlint` 1.7.12 passed on `pipeline.yml`.
- `bash -n scripts/verify-ci-apk.sh`, `git diff --check`, and strict OpenSpec validation passed.
- Lint, format check, typecheck, and Jest passed. Jest reported 31 suites and 98 tests passing.
- Temporary git-cliff 2.14.2 fixture repositories verified the first version, patch, minor, major, maintenance-only and breaking-maintenance cases, plus release notes across a beta tag.
- After including maintenance commits, separate fixtures confirmed that `build`, `chore`, `ci`, `docs`, `style`, `test`, and `refactor` commits appear under Other changes and trigger a patch bump. A breaking documentation commit triggered a major bump.
- A temporary APK verification fixture checked metadata extraction and rejected an incorrect version name.
- After implementing the manual workflow, lint, formatting, typecheck, and all 102 Jest tests passed. Actionlint and shell syntax checks passed for both workflows and release scripts.
- Release-preparation fixtures exercised the stable and beta bootstrap, source ancestry, duplicate draft tags, and stale version codes. A separate git-cliff fixture confirmed that stable notes include changes from a prior beta and later maintenance commits.
- Draft PR [#15](https://github.com/arialdev/vocabulaire/pull/15) was opened for hosted verification. Its initial runs remained queued without jobs for more than ten minutes. The PR title was restored after an attempted invalid-title check.

The application checks used `MISE_AUTO_INSTALL=0` because this sandbox cannot install the new git-cliff tool into mise's global installation directory. Git-cliff was run from a downloaded release binary in a temporary directory. Hosted GitHub Actions, a signed Android APK, and emulator behavior remain to be verified. The manual release workflow must exist on `main` before GitHub permits its dispatch.
