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

After rebasing onto `main` at `dfc861efc443f22b8810e9dd1ed9e5db690bfcd2`, the release workflow uses the build-only Android CI and static APK checks. Frozen installation, lint, formatting, typecheck, Actionlint, shell syntax, strict OpenSpec validation, and all 100 Jest tests passed locally. Hosted verification remains pending.

`EXPO_NO_CACHE=1 pnpm exec expo install --check` reported compatibility differences for the dependencies already present on `main`, including Expo packages and React. These versions were retained from `main`.

## Hosted verification after the rebase

- [Invalid-title run 43259557934](https://github.com/arialdev/vocabulaire/actions/runs/43259557934) failed `title` and skipped `checks` and `android`. Restoring the title without a new commit started [run 43259721767](https://github.com/arialdev/vocabulaire/actions/runs/43259721767), which passed all three jobs.
- Run 43259721767 produced separate `vocabulaire-preview.apk`, `SHA256SUMS`, and `build-info.txt` artifacts. Downloads through the Actions artifact API verified the SHA-256 checksum, `dev.arial.vocabulaire.preview`, version `1.0.0-pr.15.g1088c7a`, both native ABIs, and a single signing certificate. The build information recorded merge commit `1088c7a75f36bef48811b7073596d9cc3f0b95b0` and PR head `3d582cdb0844644b37e7f2d04025fcb28929e5a9`.
- [Main run 43258244633](https://github.com/arialdev/vocabulaire/actions/runs/43258244633) passed source checks, built and verified a signed APK, and published CI artifacts without creating a GitHub Release. Its APK checksum and signature were independently verified, with production package ID `dev.arial.vocabulaire`, version `1.0.0`, and Android version code `1`.
- GitHub repository settings now permit squash merges only and default the squash commit title to the PR title. The protected `main` branch requires the existing `checks` and `android` contexts and the new `title` context, all bound to GitHub Actions.
- A local dry run against the rebased source and actual GitHub release list selected `1.0.0` and generated notes since `v1.0.0-beta` without creating a release. A hosted dispatch and asset-staging run remains pending because GitHub requires the workflow file on the default branch before manual dispatch.

GitHub CLI 2.103.3 attempted to unzip the individual unarchived PR artifacts. The Actions artifact API returned the individual files successfully.
