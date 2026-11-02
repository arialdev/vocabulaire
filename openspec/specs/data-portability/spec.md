# Data portability Specification

## Purpose
Define fresh-start storage, complete versioned JSON backups, and validated atomic restore so users can transfer offline vocabulary without losing record relationships.

## Requirements

### Requirement: Fresh-start storage contract
The React Native app SHALL initialize a new database distinct from the legacy Ionic storage. It SHALL NOT automatically migrate the old Android database or interpret legacy JSON exports as new backups. Existing legacy storage SHALL NOT be deleted as part of initialization.

#### Scenario: Start on a device with old Ionic data
- **WHEN** the new app initializes while legacy app storage is present
- **THEN** the new app opens its own fresh database and onboarding state without reading or deleting the old records

### Requirement: Versioned complete JSON backups
Users SHALL export a consistent snapshot of the new application's collections, terms, category assignments, saved filters, daily-word records/history, and persisted preferences as JSON. The format SHALL include an application format identifier, schema version, and export timestamp. Stable identifiers, relationships, vocabulary text, Unicode icons, and timestamps SHALL survive an export/restore round trip.

#### Scenario: Export a populated application
- **WHEN** a user exports a backup in airplane mode
- **THEN** a valid versioned JSON file containing a consistent dataset is made available through the Android share/save flow

### Requirement: Validated restore preview and confirmation
Before changing stored data, restore SHALL validate the supported format/version, field types, identifiers, collection ownership, category types, and all record references. It SHALL show a dataset summary and clearly explain that confirming restore replaces the new app's current dataset. Canceling selection or confirmation SHALL leave all current data unchanged.

#### Scenario: Select an old Ionic export
- **WHEN** a user selects a legacy JSON file without the new format identifier/version
- **THEN** the app explains that legacy backups are unsupported and makes no database changes

#### Scenario: Reject invalid relationships
- **WHEN** a backup assigns a term a category from another collection or refers to a nonexistent record
- **THEN** restore is rejected before any current records are modified

#### Scenario: Cancel a valid restore
- **WHEN** a user cancels after viewing a valid backup's replacement summary
- **THEN** the selected collection, vocabulary, preferences, and history remain unchanged

### Requirement: Atomic restore and state refresh
Confirmed restore SHALL replace the dataset within a transaction. A failure SHALL roll back all changes. A successful restore SHALL refresh all in-memory queries, locale/theme preferences, and navigation so that no stale record references remain. The UI SHALL offer current-data export before replacement and SHALL NOT merge datasets implicitly.

#### Scenario: Restore fails after writes begin
- **WHEN** a storage failure occurs during replacement
- **THEN** the previous complete dataset remains available and the user receives an actionable error

#### Scenario: Restore succeeds while a term is open
- **WHEN** a valid backup replaces the dataset
- **THEN** navigation returns to a valid collection or empty state and displays the restored preferences and records

### Requirement: Actionable file-operation outcomes
Export and restore SHALL distinguish cancellation from malformed input, unsupported versions, missing files, and storage/share failures. Temporary export files SHALL use application-controlled paths, and file operations SHALL NOT require network access.

#### Scenario: File selection is canceled
- **WHEN** a user dismisses the Android document picker
- **THEN** the app returns to settings without an error notification or data change
