## Why

Vocabulaire's unmaintained Ionic/Angular application depends on an aging native plugin stack and a custom PNG emoji catalogue. Rebuild it around its existing purpose—organizing vocabulary into language collections—using React Native and a smaller, maintainable architecture that works offline on Android.

## What Changes

- **BREAKING:** Replace the Angular/Ionic/Capacitor/Cordova application with a React Native application using Expo development builds and Expo Router. Refactor the domain and navigation rather than reproduce the old component tree.
- Use TypeScript, pnpm, Oxlint, and Oxfmt, with the newest mutually compatible stable versions, a committed lockfile, and reproducible development/CI commands.
- Use React Native components and StyleSheet, React hooks/context, controlled forms, Jest with jest-expo and React Native Testing Library, and Maestro Android end-to-end checks.
- Retain collection and term management, notes, grammatical/thematic categories, search, sorting, compact/detailed term views, saved filters (tags), word of the day, PDF export, JSON backup/restore, onboarding, and theme settings.
- Replace nested collection-wide storage writes with normalized SQLite persistence through Expo SQLite and Drizzle ORM.
- Replace stored PNG icon references and the custom image keyboard with Unicode emoji and Android's Jetpack Emoji Picker exposed through a native wrapper.
- Keep the interface in English and Spanish; remove French and Italian interface translations for now. Vocabulary content remains unrestricted by language.
- **BREAKING:** Start with a new database and a new versioned JSON backup format. Restore backups produced by the new app; do not import old Ionic JSON exports or automatically migrate the old Android database.
- Use expo-localization with i18next/react-i18next, Expo Print/FileSystem/Sharing/DocumentPicker for exports and backups, and Drizzle Kit with bundled SQL migrations.
- Make Android the acceptance platform. Keep platform boundaries explicit so iOS and web can be added later without promising feature parity in this change.
- Defer recording and AI pronunciation assessment. Preserve stable term identities and module boundaries so later changes can add attachments and optional speech analysis without restructuring the vocabulary model.

## Capabilities

### New Capabilities

- `native-app-foundation`: Reproducible React Native/Expo Android builds, approved tooling, navigation, offline operation, and verification.
- `vocabulary-collections`: Language collections, collection-scoped term management, search, sorting, and compact/detailed display.
- `category-filtering`: Grammatical/thematic categories and named, reusable collection-scoped search filters.
- `daily-word`: Persistent, collection-specific word-of-the-day selection.
- `emoji-icons`: Unicode icons and an Android Jetpack picker integration without the legacy PNG catalogue.
- `data-portability`: Versioned JSON backup and validated, transactional restore.
- `pdf-export`: Offline generation and sharing of vocabulary PDFs.
- `localized-experience`: English/Spanish interface, onboarding, appearance preferences, and accessible mobile interactions.

### Modified Capabilities

None. There are no existing main OpenSpec specifications; the capabilities above describe the retained and revised application behavior for the first time.

## Impact

The migration affects the application source tree, dependency manifest and lockfile, Android configuration, native integration, tests, CI, and setup documentation. Angular, Ionic, Capacitor, Cordova, their obsolete test/build tools, emoji scraping utilities, and PNG emoji assets will be retired after the replacement is verified. SQLite schema and backup format become explicit versioned contracts. The existing Git history remains the reference for legacy behavior; the change does not require carrying two permanent application stacks or introducing a backend, account system, or mandatory hosted service.
