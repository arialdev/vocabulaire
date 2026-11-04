## MODIFIED Requirements

### Requirement: Versioned complete JSON backups
Users SHALL export a consistent snapshot of the new application's collections, terms, pronunciation clips, category assignments, saved filters, daily-word records/history, and persisted preferences as JSON. The format SHALL include an application format identifier, schema version 2, and export timestamp. Stable identifiers, relationships, vocabulary text, Unicode icons, timestamps, and pronunciation clip contents SHALL survive an export/restore round trip. Export SHALL enforce the supported restore file size limit and surface a recoverable error when the full snapshot exceeds it.

#### Scenario: Export a populated application
- **WHEN** a user exports a backup in airplane mode
- **THEN** a valid versioned JSON file containing a consistent dataset is made available through the Android share/save flow

#### Scenario: Round-trip pronunciation clips
- **WHEN** a user exports a notebook with pronunciation clips and confirms restore from that file
- **THEN** each clip retains its bytes and term association and can be played offline

#### Scenario: Full snapshot exceeds the restore limit
- **WHEN** the complete JSON snapshot exceeds the supported restore file size
- **THEN** the app explains the size limit and offers recovery without presenting a partial or unusable backup as ready

### Requirement: Validated restore preview and confirmation
Before changing stored data, restore SHALL validate the supported format/version, field types, identifiers, collection ownership, category types, and all record references. Version 2 restore SHALL validate clip ownership, uniqueness per term, encoding, media structure, the 7-second duration limit, and payload size. Version 1 SHALL restore as a dataset without clips. The preview SHALL show a dataset summary including the clip count and clearly explain that confirming restore replaces the new app's current dataset. Canceling selection or confirmation SHALL leave all current data unchanged.

#### Scenario: Select an old Ionic export
- **WHEN** a user selects a legacy JSON file without the new format identifier/version
- **THEN** the app explains that legacy backups are unsupported and makes no database changes

#### Scenario: Reject invalid relationships
- **WHEN** a backup assigns a term a category from another collection or refers to a nonexistent record
- **THEN** restore is rejected before any current records are modified

#### Scenario: Reject invalid audio
- **WHEN** a version 2 backup contains a malformed, oversized, duplicate, orphaned, or cross-collection clip
- **THEN** the app rejects the candidate before allowing restore confirmation

#### Scenario: Restore a version 1 backup over a notebook with audio
- **WHEN** a user confirms replacement with a valid version 1 backup
- **THEN** the restored dataset contains no clips, even when a restored term reuses a previous term ID

#### Scenario: Cancel a valid restore
- **WHEN** a user cancels after viewing a valid backup's replacement summary
- **THEN** the selected collection, vocabulary, clips, preferences, and history remain unchanged

### Requirement: Atomic restore and state refresh
Confirmed restore SHALL replace the dataset, including pronunciation clips, within a transaction. A failure SHALL roll back all changes. A successful restore SHALL refresh all in-memory queries, locale/theme preferences, media sessions, and navigation so that no stale record references remain. The UI SHALL offer current-data export before replacement and SHALL NOT merge datasets implicitly.

#### Scenario: Restore fails after writes begin
- **WHEN** a storage failure occurs during replacement
- **THEN** the previous complete dataset, including clips, remains available and the user receives an actionable error

#### Scenario: Restore succeeds while a term is open
- **WHEN** a valid backup replaces the dataset
- **THEN** navigation returns to a valid collection or empty state and displays the restored preferences and records without retaining previous audio playback or drafts
