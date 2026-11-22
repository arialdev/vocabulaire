# Android CI Specification

## Purpose
Define reliable Android CI checks, APK signing and artifacts, and diagnostic requirements.

## Requirements

### Requirement: Conventional Commit PR titles
Pull requests targeting `main` SHALL pass a required Conventional Commit title check before merging. The title check SHALL run independently of the quality and Android jobs and SHALL revalidate edits to the title. The repository SHALL use squash merges with the PR title as the default squash commit subject.

#### Scenario: A PR title is invalid
- **WHEN** a pull request targeting `main` opens or is edited with a title that fails Conventional Commit validation
- **THEN** the required title check fails and blocks merging until the title is corrected, while quality and Android checks run independently

#### Scenario: A contributor corrects an invalid title
- **WHEN** a contributor edits an invalid PR title to follow Conventional Commits without pushing a new commit
- **THEN** the title check reruns and reports the corrected title without restarting the quality or Android jobs

#### Scenario: A contributor edits the PR description
- **WHEN** a contributor changes the PR description without pushing a new commit
- **THEN** the title check may rerun, and quality and Android jobs continue without cancellation or a new run

#### Scenario: A validated PR is merged
- **WHEN** a pull request with a valid title is squash-merged using the default message
- **THEN** its commit on `main` has a Conventional Commit subject that release tooling can interpret

### Requirement: CI checks pull requests and main
CI SHALL run on pull requests targeting `main` from any branch when opened, reopened, or updated with a new commit, and on every push to `main`. CI SHALL use the pinned toolchain and frozen dependency installation and enforce lint, formatting, type checking, Jest with coverage, Android build, and static APK verification independently of the title check.

#### Scenario: Pull request is updated
- **WHEN** a pull request targeting `main` receives a new commit
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

### Requirement: Failure diagnostics and test evidence
CI SHALL retain available Jest output and coverage for a bounded, documented period. Diagnostic collection SHALL NOT conceal the original test result.

#### Scenario: Jest fails
- **WHEN** Jest exits unsuccessfully
- **THEN** CI reports failure and retains available test output and coverage

### Requirement: Meaningful Android smoke test
The local Maestro smoke flow SHALL target the installed standalone APK's application ID and exercise first-run collection creation, term creation, and persistence across application restart on a disposable Android device or emulator. It SHALL scroll as needed to reach Save and retain the persistence assertions.

#### Scenario: Run local acceptance against a preview APK
- **WHEN** a reviewer installs a preview APK on a disposable Android device or emulator and runs the first-collection flow with the preview application ID
- **THEN** the flow exercises the installed preview and checks that the term remains visible in its collection after restarting the app

#### Scenario: Term editor extends beyond screen
- **WHEN** Save is below the visible area on the local device or emulator
- **THEN** the flow makes it visible, saves the term, and verifies it after restart

### Requirement: Zero-cost service and secret isolation
CI SHALL use existing standard GitHub-hosted runners and the existing Expo and Android toolchain without requiring a paid service. PR workflows SHALL NOT access production signing credentials or execute untrusted PR code in privileged event contexts. The owner SHALL be given documented quota and spending controls.

#### Scenario: Fork pull request
- **WHEN** an untrusted fork opens a pull request against main
- **THEN** its checks do not require or expose production signing secrets

### Requirement: Remove SonarCloud integration
The repository SHALL remove the SonarCloud scan and its configuration while continuing Oxlint and Jest coverage checks.

#### Scenario: Run CI without Sonar credentials
- **WHEN** CI runs without a Sonar token
- **THEN** lint, tests and coverage run independently of SonarCloud
