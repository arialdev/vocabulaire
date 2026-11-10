# Android CI Specification

## Purpose
Define reliable Android CI checks, APK signing and artifacts, and diagnostic requirements.

## Requirements

### Requirement: CI checks pull requests and main
CI SHALL run on pull requests targeting main from any branch when opened, reopened, or updated, and on pushes to main. It SHALL use the pinned toolchain and frozen dependency installation, and enforce lint, formatting, type checking, Jest with coverage, Android build and Maestro smoke checks.

#### Scenario: Pull request is updated
- **WHEN** a pull request targeting main receives a new commit
- **THEN** CI checks the updated proposed changes and reports failures as failures

#### Scenario: Main receives a commit
- **WHEN** a commit is pushed to main
- **THEN** CI runs the required quality and Android checks on that commit

### Requirement: Installable isolated preview APK
CI SHALL produce a test-signed standalone PR APK with bundled JavaScript, an application ID distinct from production and arm64-v8a support. The Android smoke flow SHALL target the actual installed app ID and execute on a compatible emulator build.

#### Scenario: Review a successful pull request
- **WHEN** the pull request build and checks succeed
- **THEN** an identifiable preview APK is available as an artifact and can be installed alongside production without Metro

### Requirement: Signed main APK
CI SHALL produce an arm64-v8a-capable standalone APK on main signed with a persistent production key provided through protected credentials. It SHALL verify the package identity and signing certificate, identify the source commit and provide a checksum. It MUST fail without release credentials rather than silently using a debug key.

#### Scenario: Release signing is configured
- **WHEN** main checks and release signing succeed
- **THEN** the signed APK and verification metadata are available as artifacts

#### Scenario: Release signing is unavailable
- **WHEN** the release key or required credentials are missing
- **THEN** the release job fails clearly and does not publish a debug-signed APK as a release

### Requirement: Failure diagnostics and test evidence
CI SHALL retain Jest output and coverage, and SHALL collect available Maestro logs, screenshots, UI hierarchy and Android logs when Android testing fails. Diagnostic collection SHALL NOT conceal the original test result. Retention SHALL be bounded and documented.

#### Scenario: Maestro fails
- **WHEN** a smoke test fails after the emulator starts
- **THEN** the job fails and available failure diagnostics are uploaded for investigation

#### Scenario: Jest fails
- **WHEN** Jest exits unsuccessfully
- **THEN** CI reports failure and retains available test output and coverage

### Requirement: Meaningful Android smoke test
The smoke test SHALL exercise first-run collection creation, term creation and persistence across application restart. It SHALL handle scrolling as required on the configured CI emulator without weakening assertions, and failure causes SHALL be investigated rather than hidden by unconditional retries.

#### Scenario: Term editor extends beyond screen
- **WHEN** Save is below the visible area on the CI emulator
- **THEN** the flow makes it visible, saves the term and verifies it after restart

### Requirement: Zero-cost service and secret isolation
CI SHALL use existing standard GitHub-hosted runners and the existing Expo and Android toolchain without requiring a paid service. PR workflows SHALL NOT access production signing credentials or execute untrusted PR code in privileged event contexts. The owner SHALL be given documented quota and spending controls.

#### Scenario: Fork pull request
- **WHEN** an untrusted fork opens a pull request against main
- **THEN** its checks do not require or expose production signing secrets
