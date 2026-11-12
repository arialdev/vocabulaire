# Vocabulaire

Vocabulaire is an offline Android app for organizing vocabulary in collections. Add expressions, translations, notes and grammatical or thematic categories; search and sort terms, save filters, review a daily word, and export a PDF or JSON backup. Collection names and vocabulary can use any language. The interface supports English and Spanish and offers light, dark and system appearance.

This React Native version starts with a new database. It neither migrates the old Ionic database nor imports old Ionic JSON exports. Back up data created by this version using its own backup screen; restoring a supported backup replaces the current dataset. See [BACKUP-FORMAT.md](BACKUP-FORMAT.md). Terms can include an optional pronunciation recording of up to seven seconds. Android is the acceptance platform; iOS and web are not yet supported releases.

The migration and its outstanding verification are tracked in [OpenSpec](openspec/changes/migrate-to-react-native/tasks.md).

## License

Starting with the license-change commit on 2026-11-08, the project's original code is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). The source remains publicly available, but this is not an open-source license.

The license permits use, modification and redistribution for its permitted purposes, including noncommercial purposes and the organization-specific uses described in the license. Commercial uses outside those permissions require separate authorization from the copyright holder. Redistribution must include the license text or its URL and the `Required Notice:` attribution supplied in `LICENSE`; this also applies to modified versions. The license does not require publishing modified source code.

Versions previously released under GNU GPL version 3 remain available under those terms. This change does not revoke permissions already granted for that code and does not retroactively restrict its reuse. The previous license is preserved in Git history. Third-party dependencies, fonts, icons and other third-party materials retain their own licenses; bundled font and icon-font notices are in [`assets/fonts/`](assets/fonts/).

## Prerequisites

Install [mise](https://mise.jdx.dev/) and the Android SDK, including platform tools, platform 37, build tools 37.0.0, NDK 27.1.12297006 and CMake 3.22.1. `mise.toml` pins Node, pnpm and Java for this project. Set `ANDROID_HOME` to the SDK directory and put `$ANDROID_HOME/platform-tools` and `$ANDROID_HOME/emulator` on `PATH`; on macOS the SDK is normally `$HOME/Library/Android/sdk`. Install SDK packages with the `sdkmanager` executable under `$ANDROID_HOME/cmdline-tools/latest/bin`.

```sh
mise install
mise exec -- pnpm install --frozen-lockfile
sdkmanager 'platforms;android-37.0' 'build-tools;37.0.0' 'ndk;27.1.12297006' 'cmake;3.22.1'
```

## Android development

Start an Android emulator or connect a device. Generate the native project and install a local development build:

```sh
mise exec -- pnpm exec expo prebuild --platform android --no-install
mise exec -- pnpm android
mise exec -- pnpm start --dev-client
```

The Android emoji picker is an app-owned Expo module backed by Jetpack. It is included when the native project is generated and requires a development build; Expo Go cannot load it. Select an emoji and apply it in the picker, then save the containing form to persist it. The bundled typefaces and icons work offline; their license notices are in `assets/fonts/`.

For a standalone arm64 release APK with bundled JavaScript, run:

```sh
CI=1 EXPO_OFFLINE=1 mise exec -- pnpm exec expo prebuild --platform android --no-install
cd android
mise exec -- ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

The generated APK is `android/app/build/outputs/apk/release/app-release.apk`. This local release uses the generated project's development signing configuration and is not a store-signed production artifact. Native generation can replace the generated `android/` directory; keep native source changes in app configuration and `modules/`.

## Checks

```sh
mise exec -- pnpm lint
mise exec -- pnpm format:check
mise exec -- pnpm typecheck
mise exec -- pnpm test --runInBand
mise exec -- pnpm exec expo install --check
```

Install [Maestro](https://docs.maestro.dev/) 2.12.0 for Android UI tests. The checks have used an Android 37.0 `google_apis_playstore` arm64 emulator. With an emulator running and a standalone APK installed, for example:

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell pm clear dev.arial.vocabulaire
maestro test -e APP_ID=dev.arial.vocabulaire .maestro/first-collection.yaml
maestro test .maestro/categories-filters.yaml
maestro test .maestro/form-guards.yaml
```

These flows clear the app's data on the selected emulator. Use a disposable test device. The review fixture in `.maestro/fixtures/field-notebook-review.json` is test-only; push it to the disposable device's Downloads folder before running `review-fixture.yaml` or `pdf-handoff.yaml`. The detailed design-acceptance results are recorded in [verification.md](openspec/changes/implement-field-notebook-design/verification.md). See [COMPATIBILITY.md](COMPATIBILITY.md) for the tested dependency matrix, recorded Android results and the accepted Expo online compatibility warnings. The ignored `.legacy/` directory, if present from migration work, is local reference material; historical source is also available in Git history.

For isolated visual review of the transient restore and proven-rollback presentations, build with `EXPO_PUBLIC_NOTEBOOK_REVIEW_FAULTS=1` and run `.maestro/visual-restore-faults.yaml` with the supported restore fixture in Downloads. The two review controls only select presentation states; they do not perform a restore or simulate a database rollback. Never distribute that review build. Rebuild with the variable unset or set to `0` for normal use; the normal build has no review controls. The flow clears the selected emulator's app data.

## Android CI and signing

Pull requests to `main` require source checks and an Android build with static APK verification. The checks cover lint, formatting, type checking, and Jest with coverage. Automatic CI does not boot an emulator or run Maestro. Run native Android acceptance locally on a disposable device or emulator.

An independent required check validates PR titles against Conventional Commits. Editing a PR title or description reruns that check without restarting the Android CI workflow.

A successful pull request uploads a standalone preview APK with application ID `dev.arial.vocabulaire.preview`. It can coexist with the production app and uses Expo's public development signing key for testing. Pushes to `main` build `dev.arial.vocabulaire` with the release key. Both APKs contain arm64-v8a and x86_64 native code. APK artifacts include checksums and signing metadata. Jest output and coverage, plus APK artifacts, are retained for seven days.

With a preview APK and an Android device or emulator connected through ADB, install it, clear its data, and run the first-collection acceptance flow:

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell pm clear dev.arial.vocabulaire.preview
maestro test -e APP_ID=dev.arial.vocabulaire.preview .maestro/first-collection.yaml
```

The first-collection flow covers onboarding, collection creation, term creation, and persistence after an app restart. Other local Maestro acceptance flows are listed above.

See [Android release signing](docs/android-signing.md) for keystore setup, backups and instructions for updating signing secrets.

See [Release process](docs/release.md) for the manual Android stable and beta release process.

Only standard GitHub-hosted runners are used; public repositories currently receive free compute, while private repositories and artifact storage have plan limits. Configure GitHub billing with a zero-spend budget that stops usage at its limit, and monitor storage; otherwise account settings can permit charges. Artifact expiry is not a substitute for a durable backup of the release key or APK.
