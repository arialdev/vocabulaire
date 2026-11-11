## Context

`Android CI` already builds standalone APKs, uses the persistent production signing key on `main`, verifies the package and signer, and runs a Maestro smoke test. It uploads the resulting files as a seven-day artifact. The only existing release tag is `v1.0.0-beta`, and Expo's checked-in version is `1.0.0`.

## Goals / Non-Goals

**Goals**

- Give maintainers one explicit action to publish a verified stable or beta APK.
- Derive release versions and notes from Conventional Commits using maintained tooling.
- Keep preview builds identifiable and easy to download.

**Non-goals**

- Google Play distribution and a separate beta application ID.
- Promotion of artifacts from prior CI runs. The release build embeds its final version name and code before smoke testing.

## Decisions

### Manual dispatch on `main`

Use a GitHub Actions `workflow_dispatch` workflow with a channel input defaulting to `stable` and an optional full commit SHA. Run it from the protected `main` ref. Resolve the source once to the dispatch SHA or the supplied SHA. Check that the source is reachable from the dispatch SHA, includes the last published stable release or the first-release cutoff, and contains the version-aware build configuration. Use the resolved SHA for checkout, changelog, metadata, and the GitHub tag. These checks let a maintainer choose an older tested revision while keeping the release on the supported `main` history.

### Conventional Commits and git-cliff

Run the pinned `amannn/action-semantic-pull-request` action as the first job of `Android CI` for `pull_request` events targeting `main`. Give the title job read-only PR access and omit checkout. Make `checks` depend on the title job, and keep the Android build and smoke test dependent on `checks`. Use native GitHub Actions job dependencies so a failed title check skips the downstream jobs. The `main` push path bypasses the title job and still runs `checks` and Android verification.

Add `edited` to the existing `opened`, `reopened`, and `synchronize` triggers. Keep the existing per-PR concurrency group so a new run supersedes an in-progress run for the same PR. This lets a corrected title start the full pipeline without a new commit. GitHub also emits `edited` for PR description changes, so these edits can rerun CI with a valid title.

Require PRs and the title status check for `main`, enable squash as the sole merge method, and set the default squash commit message to the PR title. Maintainers keep the suggested subject when merging.

Use a pinned git-cliff version and checked-in configuration for Conventional Commit bumps and grouped release notes. Start stable releases at `1.0.0` and generate the first notes from `v1.0.0-beta` through the selected source. Subsequent releases use the last published stable tag as the baseline. Configure `feat` for minor bumps, breaking changes for major bumps, and other conventional commits, including maintenance, for patch bumps. Include maintenance in the release notes. If there are no new conventional commits after the first stable release, end the dispatch with a clear message and no publication. Beta tags use `vX.Y.Z-beta.N` and leave the stable changelog baseline intact.

GitHub's generated release notes would provide a PR summary with a manually selected version. Release Please would put version and changelog review in a dedicated release PR and target its merge commit. Git-cliff provides commit-based notes and version calculation at dispatch, with no release commit or release PR needed.

### APK versions and shared build

Use the newest stable release version reachable from the CI base commit, with `1.0.0` as the initial fallback. Main APKs use the plain version. PR APKs append `-pr.<number>.g<short-tested-sha>` and keep the full checked-out SHA and the PR head SHA in build information. The `g` prefix keeps the short hash valid as a SemVer identifier even when it consists entirely of digits.

Share the existing Expo, Gradle, verification, and Maestro steps through a reusable workflow. Pass the release version to Expo before prebuild and verify the built APK's actual version name, version code, application ID, supported ABIs, and signer. Use the same production application ID and key for stable and beta, so a newer beta can update a stable installation and the next stable release can update the beta. Derive production release version codes from a documented starting offset plus the single release workflow's run number. Use the same number as the beta suffix `N`.

### Assets and publication

Upload the successful PR APK, `SHA256SUMS`, and `build-info.txt` with single-file artifact uploads using `archive: false`. Keep test and smoke diagnostics on their existing retention schedule. Include the resolved SHA, APK version name and code, application ID, signing certificate fingerprint, and workflow run reference in build information.

Keep publication in a job with `contents: write` that consumes only the verified output of the current release workflow. Grant signing credentials only to the trusted build job. Serialize stable and beta dispatches, check for existing release tags, and reject a version code at or below a previously published code for the same application ID and signer. Use `gh release create` with the resolved SHA, generated notes, and the three files. GitHub CLI stages assets on a draft before publishing. Mark beta releases as prereleases and leave the latest stable release designation intact.

## Risks / Trade-offs

- Rebuilding adds one build and smoke test per dispatch. Testing the actual distribution APK verifies its final version and signer.
- GitHub preserves the workflow run number on rerun. The published version-code check stops an older rerun from creating a release that existing users cannot install as an update.
- Publication creates the tag at the resolved source before uploading assets. If publication fails, verify the tag, draft, source, and run before removing the incomplete draft and its tag and retrying. Published releases retain their original tags and assets.
- Historical commits predate title enforcement. Bootstrap notes use the existing history since `v1.0.0-beta`. Required title validation governs future PRs.

## Migration Plan

1. Land the CI and release workflows and document the signing and publication steps. Confirm the starting version-code offset against previously distributed APKs signed with the current key.
2. Configure squash defaults and add the title check to `main` protection after the check has run successfully on a PR.
3. Verify PR and main CI in GitHub. Exercise the release build and asset staging without public distribution during verification. Publish a stable or beta release only through an explicit maintainer dispatch.
4. To roll back, disable the release workflow and revert its configuration. Preserve published tags, assets, and the highest distributed Android version code for any future rollout.
