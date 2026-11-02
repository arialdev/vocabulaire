# Emoji icons Specification

## Purpose
Preserve complete Unicode icons and provide an accessible offline Android emoji picker through a reproducible local Expo native integration.

## Requirements

### Requirement: Unicode icon persistence
Collection and saved-filter icons SHALL be stored as Unicode strings and rendered without the legacy PNG emoji catalogue or scraping utilities. A selected emoji sequence SHALL be preserved intact, including variation selectors, skin tones, regional indicators, and zero-width joiners. Character handling SHALL NOT truncate a sequence to one UTF-16 code unit.

#### Scenario: Save a compound emoji
- **WHEN** a user selects a flag, skin-tone variant, or joined family emoji
- **THEN** the complete selected sequence survives persistence, navigation, and JSON backup/restore

### Requirement: Android native picker
On Android, tapping the icon control SHALL open Jetpack's Emoji Picker through an app-owned native wrapper. Selection SHALL return a Unicode string to the form. Dismissing the picker or pressing Back without selecting SHALL preserve the existing icon. Selecting an icon SHALL NOT commit the containing form automatically.

#### Scenario: Choose an icon without opening the keyboard
- **WHEN** a user taps the collection icon control
- **THEN** the native picker appears directly without requiring the user's keyboard to switch to its emoji panel

#### Scenario: Cancel icon selection
- **WHEN** the user dismisses the picker without a selection
- **THEN** the prior form value remains unchanged and focus/navigation recover normally

### Requirement: Isolated and reproducible native integration
The picker SHALL be implemented as a local Expo native module with native source and dependency declarations stored outside disposable generated Android project files. Native project regeneration SHALL retain the integration. Shared application modules SHALL NOT assume that the Android picker exists on other platforms.

#### Scenario: Rebuild from generated native projects
- **WHEN** Android native files are generated in a clean checkout and the app is built
- **THEN** the picker module is linked and usable without undocumented edits to generated files

### Requirement: Picker usability and offline behavior
The picker SHALL support the library's category browsing and emoji variants, remain usable without network access, and respect Android Back dismissal and the selected appearance theme. Accessible labels SHALL explain icon controls independently of the emoji image or glyph.

#### Scenario: Select emoji offline in dark mode
- **WHEN** a user opens the picker in airplane mode with dark appearance enabled
- **THEN** available emoji and variants remain selectable and the picker controls remain readable
