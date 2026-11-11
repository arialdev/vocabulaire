## Context

Branch protection for `main` requires `checks` and `android`. The `android` job currently builds and verifies an APK, runs Maestro on an emulator, and uploads the APK only if the job is still successful. In PR #16, the first attempt lost ADB at app launch. The second opened the emoji picker before Maestro lost its connection while reading the UI hierarchy. [Attempt 1](https://github.com/arialdev/vocabulaire/actions/runs/43105821564/job/130809685488) · [Attempt 2](https://github.com/arialdev/vocabulaire/actions/runs/43105821564/job/130819202962)

## Goals / Non-Goals

- Keep lint, formatting, type checking, Jest with coverage, and the Android build and APK verification required on PRs and `main`.
- Publish the verified APK and its metadata after each successful build. Run Android runtime acceptance locally using the existing flows.

## Decisions

1. Keep the `checks` and `android` jobs in `.github/workflows/pipeline.yml`. Run APK upload directly after the variant-specific verification steps. Keep the existing artifact names and contents, including `SHA256SUMS`, package and signing metadata, and source commit information. Keep production signing in the trusted `main` build and the separate test-signed application ID for previews. Retaining the job names lets the existing branch protection enforce both checks.
2. Remove the hosted Maestro installation, KVM setup, emulator action, and emulator diagnostics upload. Delete the CI-only smoke wrapper and its dedicated Jest tests once a reference search confirms they serve only the removed steps. The README's local instructions can use the existing first-collection flow with the installed APK's actual package ID. Keeping a shorter hosted flow would retain the ADB dependency that failed during launch. A manual hosted workflow would keep remote device testing available and add infrastructure to maintain.
3. Set `shell: bash` on the Jest and coverage step so GitHub Actions enables `pipefail` for the `tee` pipeline. Retain the existing upload condition for available Jest logs and coverage so they can be inspected after a failed test run. Capturing the Jest exit status explicitly would serve the same purpose with extra shell code.

## Risks / Trade-offs

- Static verification can catch a wrong package ID, a missing ABI, or an invalid signature. Startup, native UI, and persistence after restart require a local device run. Document how to install the standalone preview and run the local flow on a disposable Android device or emulator.
- A successful preview run verifies the PR packaging path. The production certificate comparison and release artifact require separate evidence from a trusted `main` run.

## Migration Plan

Land the workflow and README updates together. Verify the new required jobs and preview artifact on a hosted PR, then inspect the first trusted `main` run for release verification and upload. If the workflow needs to be reverted, revert the change as a unit so the original steps and their helper return together.
