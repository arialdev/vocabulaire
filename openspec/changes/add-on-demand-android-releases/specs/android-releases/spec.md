## ADDED Requirements

### Requirement: Publish Android releases on demand
The Android release workflow SHALL run on explicit maintainer dispatch from `main`, with stable as the default channel and beta as an option. The workflow SHALL default to the `main` SHA captured at dispatch. An explicit source SHA MUST be reachable from that commit, include the previous stable release or the first-release cutoff, and support release version configuration. Checkout, release notes, build information, and tagging SHALL refer to the resolved source.

#### Scenario: Main receives an ordinary push
- **WHEN** a commit is pushed to `main`
- **THEN** normal CI runs without creating a GitHub Release or release tag

#### Scenario: Maintainer dispatches with default inputs
- **WHEN** a maintainer starts the release workflow from `main` without supplying a SHA or channel
- **THEN** the stable release uses the `main` commit captured at dispatch even if `main` advances during the run

#### Scenario: Maintainer selects a source commit
- **WHEN** a maintainer supplies an eligible earlier SHA on `main`
- **THEN** the release builds and tags that commit

#### Scenario: Selected source is ineligible
- **WHEN** the workflow is dispatched from another ref or the supplied source fails an eligibility check
- **THEN** the workflow reports the reason before signing or publishing

### Requirement: Derive release versions and notes from commit history
Stable release versions SHALL use `x.y.z`. After the first stable release, the next base version SHALL derive from Conventional Commits since the last published stable tag. Breaking changes SHALL trigger a major bump, features a minor bump, and other conventional commits, including maintenance, a patch bump. Release notes SHALL include a changelog derived from the same commit history through the selected SHA, including maintenance commits. The first stable release SHALL use `1.0.0` and take its changelog from commits after `v1.0.0-beta`.

#### Scenario: Conventional changes span a beta
- **WHEN** changes have been shipped in a beta since the last stable release and a stable release is requested
- **THEN** the version and notes account for eligible changes from the entire stable-to-selected-commit range, including changes already shipped in the beta

#### Scenario: Changes only warrant maintenance
- **WHEN** the workflow is dispatched after the first stable release and the conventional commits since the latest stable release consist solely of non-breaking maintenance changes
- **THEN** the next version is a patch release and the changelog includes those changes

### Requirement: Verify the distribution APK before publication
The workflow SHALL build a standalone APK with the resolved release version name and Android version code, sign it with the production key, and verify its package identity, supported ABIs and signing certificate. The workflow SHALL use a shared increasing Android version-code sequence for stable and beta releases of the production application.

#### Scenario: Release APK fails validation
- **WHEN** production signing is unavailable or the APK metadata or signature differs from the expected values
- **THEN** no release is published and available diagnostics are retained

#### Scenario: A retry would publish a duplicate or lower version code
- **WHEN** the release already exists or its version code is at or below a code already distributed for the same application and signing key
- **THEN** the workflow leaves published releases untouched

### Requirement: Distribute stable and beta APKs as GitHub Release assets
Every published Android release SHALL contain the signed APK, SHA-256 checksum, and build information as separate GitHub Release assets outside the CI artifact retention policy. The build information SHALL identify the source SHA, APK version name and code, application ID, signing certificate fingerprint, and workflow run. Beta releases SHALL use a semantic prerelease version and a GitHub prerelease designation.

#### Scenario: All release assets are ready
- **WHEN** release verification and asset uploads succeed
- **THEN** users can download the APK, checksum, and build information individually from the release page

#### Scenario: Beta is distributed
- **WHEN** a maintainer dispatches a beta release that passes verification
- **THEN** the signed APK is published as a GitHub prerelease and the latest stable release designation is preserved

#### Scenario: A release asset cannot be uploaded
- **WHEN** upload of a required file fails
- **THEN** no incomplete release is made public
