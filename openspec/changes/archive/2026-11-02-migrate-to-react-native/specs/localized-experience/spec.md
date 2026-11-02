## ADDED Requirements

### Requirement: English and Spanish interface
The application SHALL bundle complete English and Spanish interface translations using expo-localization and i18next/react-i18next. It SHALL initially select a supported device language or fall back to English, allow an explicit language choice, and persist that choice. French and Italian interface options SHALL be removed for this change. Interface language SHALL remain independent of collection names and vocabulary content.

#### Scenario: First launch on a Spanish device
- **WHEN** no saved language preference exists and the device requests Spanish
- **THEN** onboarding and the rest of the interface display Spanish without downloading translations

#### Scenario: Unsupported device language
- **WHEN** a device requests a language other than English or Spanish and no override exists
- **THEN** the interface falls back to English while allowing arbitrary-language vocabulary

#### Scenario: Change interface language
- **WHEN** a user selects Spanish or English in settings
- **THEN** visible application labels, validation, and export labels update, and the preference survives restart without changing vocabulary

### Requirement: Appearance preferences
The application SHALL provide light and dark appearances with an optional system-following setting, persist the selected preference, and keep screens, dialogs, icon controls, and native picker readable in both modes.

#### Scenario: Reopen with a saved appearance
- **WHEN** the app restarts after dark appearance was selected
- **THEN** it restores that appearance before exposing the main screens without overwriting other settings

### Requirement: Resumable onboarding and empty states
First launch SHALL introduce the application's offline collection/term model and guide the user to create or restore a collection. Onboarding SHALL NOT repeatedly block users who completed it. Canceling or interrupting first collection creation SHALL leave a recoverable state, and deleting the last collection SHALL provide a way to create or restore another without requiring an application reset.

#### Scenario: Interrupt the first collection form
- **WHEN** the user exits before saving a first collection
- **THEN** the next launch offers a coherent onboarding or empty state with no partially committed collection

### Requirement: Accessible native interactions
The application SHALL provide accessible names for icon-only actions, readable text scaling, usable keyboard avoidance, and predictable Android Back behavior. Validation and storage errors SHALL be visible and actionable. Form cancellation SHALL NOT commit unsaved changes.

#### Scenario: Edit with the keyboard open
- **WHEN** a user edits a long term or note on a small Android screen with enlarged text
- **THEN** the focused field, validation messages, and save/cancel actions remain reachable

#### Scenario: Navigate Back from an unsaved form
- **WHEN** a user leaves a changed form without saving
- **THEN** the app provides a discard/cancel choice and commits no unintended edits
