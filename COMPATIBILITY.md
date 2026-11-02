# Android foundation compatibility

Research and checks performed on 2026-10-28 for the staged Expo application.
The project owner chose to keep the latest tested versions while documenting Expo's online compatibility warnings.

| Tool or package                                | Tested version             |
| ---------------------------------------------- | -------------------------- |
| Node.js / pnpm                                 | 26.12.1 / 12.16.1          |
| Java                                           | Eclipse Temurin 26.0.2.1+1 |
| Expo / React Native / React                    | 58.0.21 / 0.88.1 / 19.3.0  |
| TypeScript                                     | 7.0.2                      |
| Jest / jest-expo                               | 30.5.2 / 58.0.13           |
| React Native Testing Library / Test Renderer   | 14.1.0 / 1.3.1             |
| Oxlint / Oxfmt                                 | 1.90.0 / 0.75.0            |
| Gradle / Kotlin                                | 9.4.1 / 2.2.10             |
| Android compile SDK / target SDK / minimum SDK | 37 / 36 / 24               |
| Android build tools / NDK                      | 37.0.0 / 27.1.12297006     |

Expo's default SDK 58 template and the installed `expo/bundledNativeModules.json` both specify React Native 0.88.1 and React 19.3.0. The installed React Native renderer reports React 19.3.0. Expo's **online** `expo install --check` instead recommends React Native 0.88.0 and TypeScript `~6.0.3`; it exits unsuccessfully for the staged versions. Its offline check passes but explicitly says offline validation is unreliable. Do not treat either result as proof of universal compatibility or suppress the online warning silently.

TypeScript 7 passed the current project's strict type check. Jest component and Expo Router smoke tests passed under Node 26. The Android debug development app built successfully using the pinned JDK 26 for arm64; this is a build check, not a device or offline application test.

From this project directory, the successful local checks were:

```sh
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm lint
mise exec -- pnpm typecheck
mise exec -- pnpm format:check
mise exec -- pnpm test --runInBand
CI=1 EXPO_OFFLINE=1 mise exec -- pnpm exec expo prebuild --platform android --no-install
```

From the generated `android` directory, with the Android SDK installed:

```sh
ANDROID_HOME="$HOME/Library/Android/sdk" mise exec -- ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
```

Gradle reported deprecation warnings in Expo/React Native dependencies that are relevant to a future Gradle 10 upgrade. Native build success does not verify the deferred Jetpack picker or persistence functionality.

The SQLite-enabled debug build also completed with Expo SQLite 58.0.14, Drizzle ORM 0.45.4, Drizzle Kit 0.31.11 and babel-plugin-inline-import 3.0.0. On the Android API 37 emulator the generated migration created all eight application tables and one Drizzle migration record; an extracted test database passed SQLite integrity_check. This is a startup smoke check, not yet a transaction, ownership, or restart-durability verification.

Google Maven metadata identifies `androidx.emoji2:emoji2-emojipicker:1.7.0` as the latest stable release. A clean prebuild linked the local module, the Android debug build succeeded, and an API 37 emulator displayed the picker and returned a selected emoji to the collection draft. Android Back closed the picker and preserved the draft icon. Compound sequences, offline startup, accessibility, and theme handling still require verification.

The installed package metadata specifies these principal peer constraints: React Native 0.88.1 requires React `^19.3.0` and React types `^19.1.1`; its bundled Fabric renderer reports 19.3.0, matching the installed React patch. jest-expo 58.0.13 requires Jest `^29 || ^30` and `@react-native/jest-preset ^0.88.1`; React Native Testing Library 14.1.0 requires React >=19, React Native >=0.78, Jest >=29, and test-renderer ^1.0.0. The installed test-renderer 1.3.1 accepts React ^19.0.0. Expo Router's nonoptional installed peers include the matching SDK modules, React Native Screens ^4.30.0, and Safe Area Context >=5.4.0. TypeScript 7.0.2 passes the application type check; this demonstrates the current project, not all possible future dependencies, works with it.

After moving the app to the repository root, a frozen pnpm install, type check, lint, Jest suite, Expo prebuild and arm64 Android debug build succeeded. The root development build opened on an API 37 emulator, and switching the interface to Spanish updated the settings screen. Retest the final app, including all remaining features, before release.

An Android process restart retained the Spanish locale and restored onboarding at step 2 after the forward `onboarding_step` migration. This is a narrow restart check; transaction rollback and general vocabulary durability remain to be tested.

The standalone bundle required `babel-preset-expo` 58.0.22 to be declared directly with pnpm's isolated layout. The preset requires `@babel/runtime ^7.20.0`, so the runtime was aligned to the latest compatible Babel 7 release, 7.29.10; `pnpm peers check` reports no peer dependency issues. The previous Babel 8 helper version did not satisfy this peer range.

With the standalone release build in airplane mode and no Metro server, Maestro 2.12.0 passed first-run collection/term creation, picker dismissal, term persistence across restart, category assignment, saved-filter application, and saved-filter persistence. A separate emoji selection run selected 😀 and stored it on the new collection. These checks used the API 37 emulator; backup, PDF, compound emoji, accessibility and complete offline acceptance remain open.

On the API 37 emulator in airplane mode, a new-format backup exported by the app was modified to distinguish its records, selected via Android Downloads, previewed, and restored over existing test data. The restored collection and term appeared and survived an app process restart. This verifies the tested replacement path; malformed-input, rollback and all-record-type device tests remain open.

The isolated Android SQLite acceptance probe in `test-support/native-database.ts` passed on the API 37 emulator: migration and re-opening, SQL-level cross-collection foreign-key rejection, failed restore rollback using an injected SQLite trigger, valid restore, daily selection/reuse, and deleted-term replacement. The probe used a uniquely named test database. Prior standalone Maestro flows separately verified collection and term data survived a process restart.

On 2026-10-30, a fresh arm64 standalone release build passed the first-collection and categories-filters Maestro flows on the API 37 emulator, including picker Back dismissal and term/filter persistence across restart. After selecting dark appearance, the native picker was visually inspected with readable dark controls and emoji. A further check verified that selecting Spanish in the app changes the native picker's category labels even on an English device. This is not a complete offline, accessibility, or compound-emoji acceptance run. The 1,000-term list interaction was checked in a component test, not profiled on a device.

The Android project was regenerated with `CI=1 EXPO_OFFLINE=1 mise exec -- pnpm exec expo prebuild --platform android --no-install`, followed by the arm64 release build. The regenerated app passed the Maestro emoji-selection flow on the API 37 emulator. The first-collection flow covers picker Back dismissal, and the Android-specific native view remains behind platform-specific module files.

The regenerated release also passed the form-guards Maestro flow: Android Back offered to retain or discard an unsaved term, and canceling term deletion retained the record. Enlarged-text and small-screen checks remain outstanding.

On 2026-10-31, a six-term backup was restored on the API 37 emulator. The daily screen displayed the same term before and after stopping and restarting the app. Repository tests cover date changes, repeated and competing JavaScript requests, edited and deleted terms, collection isolation, and the SQLite uniqueness constraint; they do not simulate simultaneous writes from multiple native processes.

On the same emulator, canceling the document picker left the dataset unchanged and selecting an old-format file displayed the unsupported-format error without replacing records. The SQLite repository test round-trips all record types with Unicode icons and vocabulary and verifies rollback using an injected failure. Other validation tests cover malformed and invalid-reference inputs.

The GitHub Actions workflow builds a standalone x86_64 APK and configures an API 37.0 emulator and pinned Maestro smoke flow; Jest coverage writes the LCOV path consumed by the existing optional Sonar scan. Local source checks and arm64 device flows passed; the updated hosted x86_64 workflow has not yet run on GitHub.

On API 37, a 720×1280 emulator with 1.5× font scaling exposed a keyboard overlap on the term editor. After adding Android keyboard scroll space, the `small-screen-keyboard` Maestro flow reached the original, translation, notes, and Save controls with the keyboard open and saved the term. The form-guards and picker-language-theme checks cover Back, discard, labeled picker controls, and language changes; translation resource parity is checked by Jest. This is not a substitute for testing every device or screen-reader combination.

On API 37, a fresh app-data launch in airplane mode opened the native picker and saved an emoji. A restored backup with 👍🏽, 🇪🇸, and 👩🏽‍💻 icons displayed the complete glyphs and retained the sequences after process restart. The control test passes a joined sequence through its selection callback; the individual compound sequences were restored rather than each selected manually from the picker.

On API 37 in airplane mode, Android Print generated and saved an English PDF and a seven-page Spanish PDF with long notes, Japanese, Arabic, Hindi, accented text and emoji. First, middle and last Spanish pages and representative pages of a 13-page English sample were rendered and visually inspected: text wrapped within the margins, page breaks preserved entries, and the tested glyphs were readable. The Spanish output was produced through the app's share/print flow from a restored dataset.

The current arm64 standalone release was exercised in airplane mode: a fresh start and picker selection, collection/term use, backup restore and export share sheet, PDF creation and save, and daily-word reuse across an app restart all worked. The offline daily-word screen showed the same entry before and after restart.

The capability review compared collection and category queries, daily selection, picker, localization, backup, PDF and foundation behavior with their specs. The review led to scrollable daily notes and visible term/category storage errors. Device evidence is from the API 37 emulator; it does not establish physical-device, screen-reader, iOS or web parity, or a hosted CI result. Expo's accepted online version warnings remain as documented above.

Final patch resolution on 2026-10-31: Expo 58.0.22, Expo development client 58.0.18, Expo Router 58.0.29, Expo SQLite 58.0.15 and React Native Screens 4.30.1. The rest of the direct dependency versions are pinned in `package.json` and the complete dependency graph in `pnpm-lock.yaml`. Node 26.12.1, pnpm 12.16.1, JDK 26.0.2, React Native 0.88.1, React 19.3.0, TypeScript 7.0.2, Jest 30.5.2, jest-expo 58.0.13, Maestro 2.12.0 and the Android 37.0 toolchain remain as above. `pnpm peers check` reports no peer issues. Expo's current online check reports only TypeScript 7 versus its recommended `~6.0.3` and exits nonzero; the owner previously accepted that documented warning, and the project type check passes with TypeScript 7.

Final checks on the cleaned tree: frozen pnpm install, peer check, Oxlint, Oxfmt, TypeScript and 27 Jest tests passed. A regenerated arm64 standalone release build succeeded at `android/app/build/outputs/apk/release/app-release.apk`; it uses local development signing. On the API 37 emulator, the rebuilt APK passed the categories-filters, emoji-selection, small-screen-keyboard and picker-language-theme Maestro flows. Earlier in this session the offline, PDF and backup results above were verified on the emulator before the final coordinated Expo patch updates. The updated GitHub-hosted x86_64 CI job has not yet run; no physical-device or full screen-reader validation is claimed.
