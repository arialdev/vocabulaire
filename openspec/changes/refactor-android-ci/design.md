## Context

Three recent main runs built and installed the x86_64 APK; Jest passed. Two Android runs could not find Save in the term editor on a 320×640 emulator. The latest stopped at launch without a useful explanation. The smoke flow does not scroll to Save, but screenshots and hierarchy were not uploaded, so an offscreen button is a hypothesis, not a confirmed cause. The CI runner currently produces no downloadable APK.

## Goals / Non-Goals

**Goals:** Provide actionable, reproducible Android checks and downloadable preview and signed main APKs; retain test output and coverage; avoid paid services and protect release credentials.

**Non-Goals:** Publish to Google Play, introduce EAS Build or another CI service, or claim hosted success from local tests. Play signing and AAB distribution can be designed later.

## Decisions

1. Use the existing GitHub Actions, Expo prebuild and Gradle toolchain with frozen installation and standard Linux runners. Pull requests targeting main run on open, reopen and updates from any branch; main pushes run checks and release packaging. EAS Build adds an account, quota and hosted service without solving the existing Maestro problem.
2. Keep lint, format, TypeScript, Jest with coverage, and a standalone APK emulator smoke test as failure-enforcing checks. Use x86_64 for the emulator and arm64-v8a for phone installation, either in one APK with both ABIs or separate clearly named artifacts. Test the actual relevant build variant and document any differences.
3. Use a separate preview application ID and test signature, with a standalone bundled JS release-like build. Parameterize Maestro's app ID for the preview and avoid hardcoded production IDs where applicable. A non-secret stable test key can enable preview updates, but its public nature must be explicit. Production data remains separate. An Expo dev client requiring Metro is less useful for offline review.
4. Sign main APKs with a new persistent owner-controlled release key injected only in trusted main jobs, via protected secrets/environment and generated native configuration compatible with Expo prebuild. The old GitHub release uses `dev.arial.vocabulaire`, the same ID as the current app, but its key is lost and the owner accepts breaking compatibility. Existing installations cannot update directly using the new key. Fail closed if signing credentials are missing; never use a debug key as a release fallback. Verify certificate, package ID and ABI; protect and back up key material. Plan version codes and upgrade compatibility; verify Android developer registration and Play requirements when distribution is arranged.
5. Diagnose the Save failure on the CI screen profile with screenshots and hierarchy, add scrolling if it is offscreen, and retain the collection, term and restart persistence assertions. Investigate the distinct launch failure using logcat and Maestro diagnostics. Do not mask a failure with unconditional retries or by enlarging the screen as a substitute for diagnosis. If app UI changes are needed, follow repository Stitch and Android verification requirements.
6. Always retain available Jest output, coverage and Maestro diagnostics including logs, screenshots and hierarchy on failure; capture logcat before emulator shutdown. Preserve original exit codes and upload diagnostic artifacts even after failures. Assign short, documented retention and limits appropriate to free storage. Keep release artifacts identifiable by commit and run and include checksum and signing verification metadata.
7. Remove SonarCloud action, token reference, configuration and stale current documentation; do not claim Oxlint supplies equivalent Sonar coverage or security analysis. Keep Jest coverage independently.

## Risks / Trade-offs

- [Hosted emulator instability or launch failure] → Capture boot, process and logcat evidence, reproduce and fix root cause; report unresolved failures.
- [Release key loss or disclosure] → Restrict credentials to trusted main, back up securely, verify fingerprints, and never expose secrets to PR builds.
- [Different IDs or ABIs invalidate verification] → Parameterize flows and verify package IDs and architecture of each artifact; exercise matching installed binaries.
- [Artifact storage or compute limits] → Use standard runners, bounded retention, and document GitHub budgets and quotas; no paid runners or EAS enrollment. Account settings must enforce a zero-spend limit.
- [PR changes run untrusted code] → Use pull_request with minimal permissions and no release secrets; never execute PR code in privileged pull_request_target.
- [Hosted verification needs credentials or owner access] → Document setup, report missing prerequisites and do not mark release verification complete without a real run.

## Migration Plan

Implement and locally test the workflow and smoke fix, configure signing outside the repository, run a PR and trusted main workflow, inspect artifacts and signing, then update documentation. Roll back the workflow change if necessary without replacing or exposing the release keystore; previously distributed APKs require compatible signing for updates.

## Open Questions

- Create and securely back up a new release key and configure repository secrets and budget settings. The owner confirmed that breaking compatibility with the unused old release is acceptable.
- Determine the cause of the latest launch failure from new diagnostics; current logs do not establish it.
