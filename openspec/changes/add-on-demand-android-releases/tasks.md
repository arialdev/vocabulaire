## 1. Commit history and release versioning

- [x] 1.1 Add the pinned `amannn/action-semantic-pull-request` job to Android CI with read-only PR access and no checkout. Run it on PR opening, reopening, updates, and edits. Gate `checks` and its downstream Android job on the result for PRs and preserve the `main` push path.
- [x] 1.2 Pin git-cliff and configure Conventional Commit version bumps and notes. Verify the `1.0.0` bootstrap, patch/minor/major changes, maintenance-only history, and stable notes across intervening beta tags using fixture histories.

## 2. Shared APK build and CI artifacts

- [x] 2.1 Reuse the existing Android build and APK verification jobs across CI and manual releases. Preserve PR isolation, production signing on `main`, pinned toolchains, and test diagnostics.
- [x] 2.2 Resolve CI version names from the stable base and PR identity. Apply version name and code before prebuild and check the resulting APK metadata with the existing identity, ABI, and signature checks.
- [x] 2.3 Extend build information with actual source, version, signing, and workflow metadata. Upload the successful PR APK, checksum, and build information as three individual files.

## 3. Manual release workflow

- [x] 3.1 Add the `main`-only manual workflow with a stable/beta choice and optional SHA. Validate the captured or selected commit, resolve the version and notes, and pass the resolved inputs to the shared build.
- [x] 3.2 Allocate a shared increasing Android version code for stable and beta. Serialize releases and verify that a duplicate tag or stale rerun cannot publish or overwrite an existing release.
- [x] 3.3 Use `gh release create` in a separate write-enabled publication job after successful verification. Attach the three required files and ensure a beta is marked as a prerelease and leaves the latest stable designation intact.

## 4. Rollout and verification

- [x] 4.1 Document the release steps, signing and version-code baseline, beta upgrade path, CI versus release retention, and incomplete draft recovery.
- [ ] 4.2 Configure squash-only merges with the PR-title default and require the Conventional Commit check on `main` after a successful hosted run. Verify that an invalid title skips quality and Android jobs, a title-only correction starts a full run, and a push to `main` runs checks independently of the title job.
- [ ] 4.3 Verify hosted PR and `main` builds, APK metadata, checksums, and separate PR downloads. Confirm an ordinary push does not publish a release.
- [ ] 4.4 Exercise release SHA selection, signing and APK verification failure gates, separate asset staging, and beta/stable version ordering using a non-public verification run. Record results and any hosted verification limits.
