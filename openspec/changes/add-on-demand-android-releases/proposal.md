## Why

Android CI produces verified APKs, but its seven-day artifacts are unsuitable for distributing releases. Maintainers need an explicit release action that derives versions and notes from meaningful changes on `main`.

## What Changes

- Add a manually dispatched Android release workflow with stable and beta channels. Default to the `main` commit captured at dispatch and allow selection of an eligible earlier commit on `main`.
- Calculate release versions and changelogs from Conventional Commits. Validate PR titles before running quality or Android jobs, revalidate on edits, and use the titles as squash commit subjects on `main`.
- Give `main` CI builds a plain semantic version and PR previews a prerelease version that identifies the PR and the tested commit. Offer the preview APK, checksum, and build information as individual downloads.
- Build, sign, and smoke-test the selected commit with its final release version. Publish the APK, checksum, and build information as individual GitHub Release assets.

## Capabilities

### New Capabilities

- `android-releases` covers manual selection, versioning, verification, and durable distribution for stable and beta releases.

### Modified Capabilities

- `android-ci` covers Conventional Commit PR titles, versioned CI APKs, and individual preview downloads.

## Impact

The change affects GitHub Actions, repository merge and branch protection settings, Android build configuration and verification, and release documentation. The approved additions are git-cliff and the semantic PR title action. Release publishing uses the GitHub CLI and the existing production signing credentials.
