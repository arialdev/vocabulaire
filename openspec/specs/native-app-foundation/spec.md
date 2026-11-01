# Native app foundation Specification

## Purpose
Define the reproducible React Native and Expo foundation, Android navigation, offline initialization, verification requirements, and boundaries for future platform extensions.

## Requirements

### Requirement: Reproducible approved toolchain
The project SHALL use React Native, Expo development builds, Expo Router, TypeScript with strict type checking, pnpm, Oxlint, and Oxfmt. It SHALL resolve the latest mutually compatible stable releases at implementation time, record exact resolved versions in its lockfile and tool configuration, and use a frozen lockfile in CI. Additional stack selections or substitutions MUST be discussed with the user before adoption.

#### Scenario: Install and verify from a clean checkout
- **WHEN** a developer follows the documented setup using the pinned tools and runs the frozen pnpm installation and quality commands
- **THEN** dependency installation, type checking, linting, formatting checks, and tests complete without requiring global Expo or React Native installations

#### Scenario: A newer release conflicts with the approved stack
- **WHEN** the newest release of a dependency cannot pass the compatibility checks for the selected Expo/React Native stack
- **THEN** the selected compatible version and reason are documented, and a stack substitution or unresolved compromise is presented to the user before proceeding

### Requirement: Android application and navigation
The application SHALL build and run on Android with its native integrations included, preserve the existing application identifier, and provide navigation between onboarding, collections, terms, categories, saved filters, word of the day, and settings. Invalid or deleted record destinations SHALL recover to an appropriate list or empty state without crashing. iOS and web release readiness SHALL remain outside this change's acceptance criteria.

#### Scenario: Run the native application
- **WHEN** an Android development build is installed and launched
- **THEN** the application opens the appropriate initial screen and its collection/term flows and native picker are usable

#### Scenario: Navigate to a removed term
- **WHEN** navigation requests a term that no longer exists
- **THEN** the application shows a recoverable missing-record state and provides a route back to the collection

### Requirement: Offline operation and startup
The application SHALL initialize its schema and settings before exposing data-dependent screens. All vocabulary, filtering, daily-word, emoji, localization, PDF, and backup operations SHALL work without a backend, account, or network connection. Initialization or migration failures SHALL show a recoverable error and SHALL NOT silently replace stored data with an empty database.

#### Scenario: Use the app in airplane mode
- **WHEN** the installed application is started without network connectivity
- **THEN** its bundled resources and persisted database support the retained user flows

#### Scenario: Schema initialization fails
- **WHEN** a database migration fails at startup
- **THEN** the application reports the failure and preserves existing data rather than entering the main screens with an apparently empty collection list

### Requirement: Behavior-focused verification
The project SHALL use Jest with jest-expo and React Native Testing Library for relevant domain/component tests and Maestro for critical Android flows. Native persistence, picker integration, and generated PDFs MUST receive device verification rather than being considered verified by JavaScript mocks alone.

#### Scenario: Verify an implementation before retiring legacy code
- **WHEN** the migration is considered complete
- **THEN** automated quality checks, a native Android build, critical Maestro flows, and documented native export/restore checks have passed, with any unavailable checks explicitly reported

### Requirement: Future speech extension boundaries
Vocabulary records SHALL have stable identities, and persistence and platform integrations SHALL remain separate from screen components. This migration SHALL NOT include recording controls, microphone permissions, audio/AI dependencies, model downloads, or pronunciation scores.

#### Scenario: Inspect the completed migration
- **WHEN** the app's functionality and dependencies are reviewed
- **THEN** vocabulary behavior is independent of speech services and a later term-attachment feature can reference existing stable term identities
