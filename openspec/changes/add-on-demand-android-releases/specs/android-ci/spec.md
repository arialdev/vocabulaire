## ADDED Requirements

### Requirement: Conventional Commit PR titles
Pull requests targeting `main` SHALL pass a required Conventional Commit title check before merging. CI SHALL run the title check before the quality and Android jobs and SHALL revalidate edits to the title. The repository SHALL use squash merges with the PR title as the default squash commit subject.

#### Scenario: A PR title is invalid
- **WHEN** a pull request targeting `main` opens or is edited with a title that fails Conventional Commit validation
- **THEN** the required check fails, skips the downstream quality and Android jobs, and blocks merging until the title is corrected

#### Scenario: A contributor corrects an invalid title
- **WHEN** a contributor edits an invalid PR title to follow Conventional Commits without pushing a new commit
- **THEN** CI starts a new run and proceeds to the quality and Android jobs after title validation succeeds

#### Scenario: A validated PR is merged
- **WHEN** a pull request with a valid title is squash-merged using the default message
- **THEN** its commit on `main` has a Conventional Commit subject that release tooling can interpret

## MODIFIED Requirements

### Requirement: CI checks pull requests and main
CI SHALL run on pull requests targeting `main` from any branch when opened, reopened, updated with a new commit, or edited to change the title. For PRs that pass the title check and for every push to `main`, CI SHALL use the pinned toolchain and frozen dependency installation and enforce lint, formatting, type checking, Jest with coverage, Android build, and static APK verification.

#### Scenario: Pull request is updated
- **WHEN** a pull request targeting `main` with a valid title receives a new commit
- **THEN** CI checks the updated proposed changes and reports failures as failures

#### Scenario: Main receives a commit
- **WHEN** a commit is pushed to `main`
- **THEN** CI runs the required quality and Android checks on that commit without requiring a PR title check

### Requirement: Installable isolated preview APK
CI SHALL produce a test-signed standalone PR APK with bundled JavaScript, an application ID distinct from production, and arm64-v8a and x86_64 support. Its Android version name SHALL be a semantic prerelease that identifies the PR number and the tested commit. The APK filename SHALL be `vocabulaire-preview-<version>.apk` using that version. CI SHALL verify the APK's package ID, ABIs, and signature. After successful verification, the APK, its SHA-256 checksum, and build information SHALL be downloadable as individual files from the run.

#### Scenario: Review a successful pull request
- **WHEN** the pull request build and checks succeed
- **THEN** the APK, checksum, and build information are available individually and the APK can be installed alongside production without Metro
- **AND** its filename and version name identify the PR and tested commit, its checksum names the downloaded APK, and its build information records the full tested SHA and PR head SHA

### Requirement: Signed main APK
CI SHALL produce an arm64-v8a-capable standalone APK on `main` signed with a persistent production key provided through protected credentials. The APK SHALL use a plain `x.y.z` Android version name. CI SHALL verify the package identity and signing certificate, identify the source commit, and provide a checksum. It MUST fail without release credentials rather than silently using a debug key.

#### Scenario: Release signing is configured
- **WHEN** main checks and release signing succeed
- **THEN** the signed APK with a plain semantic version and its verification metadata are available as CI artifacts

#### Scenario: Release signing is unavailable
- **WHEN** the release key or required credentials are missing
- **THEN** the build fails clearly and does not upload a debug-signed APK as a production artifact
