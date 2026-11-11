# Android releases

Releases are started manually from GitHub Actions. Open **Actions**, select **Release Android**, and run the workflow on `main`. Select `stable` or `beta`, and optionally supply a full commit SHA from `main`. An empty SHA uses the `main` commit captured when the workflow is dispatched. The selected commit must include the most recent stable release and the version-aware APK verification script.

The workflow calculates the version and release notes from Conventional Commits. The first stable version is `1.0.0`, with notes starting after the existing `v1.0.0-beta` tag. Later versions are based on the previous published stable release. Feature commits cause a minor bump, breaking changes a major bump, and other conventional commits a patch bump. Maintenance commits appear in the notes. Stable notes include changes previously distributed in beta releases.

The workflow runs quality checks, builds a production-signed APK, verifies its identity and signature, and runs the Android smoke test before publication. The GitHub Release contains the APK, `SHA256SUMS`, and `build-info.txt` as separate assets. Beta releases are marked as prereleases. Both channels use the production application ID and signing key, allowing a later beta or stable build with a higher version code to update an earlier build.

The release workflow uses `1000000 + GITHUB_RUN_NUMBER` for the Android version code. Both channels share this sequence. Before the first distribution, confirm that `1000001` exceeds the version codes of all APKs already distributed with the current production key. Published release metadata is checked to prevent an older rerun from distributing a lower code. Keep the workflow and its run-number sequence if releases are migrated or recreated, and preserve the highest distributed code when choosing a new baseline.

CI artifacts and diagnostics expire after seven days. Published GitHub Release assets remain attached to their release. PR previews are test-signed, have a separate application ID, and are available as three individual CI artifact downloads.

If publication fails, inspect the workflow log, the release draft, and its tag. The workflow creates the tag before uploading assets, and GitHub CLI may leave an incomplete draft if an upload fails. After confirming that the tag and any draft belong to the failed run and that no release was published, remove the incomplete draft and tag through GitHub before dispatching a new run. Published releases and their assets should be retained.
