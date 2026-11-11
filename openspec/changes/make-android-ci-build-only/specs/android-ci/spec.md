## MODIFIED Requirements

### Requirement: CI checks pull requests and main
CI SHALL run on pull requests targeting main from any branch when opened, reopened, or updated, and on pushes to main. It SHALL use the pinned toolchain and frozen dependency installation, and enforce lint, formatting, type checking, Jest with coverage, Android build, and static APK verification. It SHALL report these checks under the existing `checks` and `android` jobs. Android emulator and Maestro execution SHALL occur outside the automatic CI workflow.

#### Scenario: Pull request is updated
- **WHEN** a pull request targeting main receives a new commit
- **THEN** CI runs the source checks and builds and statically verifies the preview APK, reporting any failed check as a failure

#### Scenario: Main receives a commit
- **WHEN** a commit is pushed to main
- **THEN** CI runs the source checks and builds and statically verifies the signed release APK

#### Scenario: APK build or verification fails
- **WHEN** the Android build or APK verification exits unsuccessfully
- **THEN** the `android` job reports failure and CI withholds the APK artifact

### Requirement: Installable isolated preview APK
CI SHALL produce a test-signed standalone PR APK with bundled JavaScript, an application ID distinct from production, and native code for arm64-v8a and x86_64. CI SHALL verify the APK's package ID, ABIs, and signature, then publish the APK with its checksum and verification metadata.

#### Scenario: Review a successful pull request
- **WHEN** the pull request checks, preview APK build, and static APK verification succeed
- **THEN** CI publishes an identifiable preview APK that can be installed alongside production without Metro

### Requirement: Failure diagnostics and test evidence
CI SHALL retain available Jest output and coverage on successful and failed runs for seven days. The test step SHALL propagate Jest's exit status when saving its log.

#### Scenario: Jest fails
- **WHEN** Jest exits unsuccessfully while the log is being saved
- **THEN** the `checks` job reports failure and CI uploads available test output and coverage

### Requirement: Meaningful Android smoke test
The local Maestro smoke flow SHALL target the installed standalone APK's application ID and exercise first-run collection creation, term creation, and persistence across application restart on a disposable Android device or emulator. It SHALL scroll as needed to reach Save and retain the persistence assertions.

#### Scenario: Run local acceptance against a preview APK
- **WHEN** a reviewer installs a preview APK on a disposable Android device or emulator and runs the first-collection flow with the preview application ID
- **THEN** the flow exercises the installed preview and checks that the term remains visible in its collection after restarting the app

#### Scenario: Term editor extends beyond screen
- **WHEN** Save is below the visible area on the local device or emulator
- **THEN** the flow makes it visible, saves the term, and verifies it after restart
