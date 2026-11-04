## ADDED Requirements

### Requirement: Short offline pronunciation recording
Users SHALL be able to record one optional pronunciation clip per term while adding or editing it. The editor SHALL request microphone access on explicit Record, show when the microphone is active, allow manual stop, and automatically finish at a 7-second limit. It SHALL allow preview, replacement, and removal before saving. Capture and playback SHALL work offline and SHALL release their resources when leaving the relevant screen or backgrounding the app.

#### Scenario: Reach the pronunciation recording limit
- **WHEN** a user starts recording with microphone access and lets the recording run to its limit
- **THEN** capture stops automatically and the finished draft is available for preview or replacement

#### Scenario: Microphone access is denied or recording fails
- **WHEN** microphone permission is denied or a recording cannot be completed
- **THEN** the editor explains the failure with an appropriate recovery action and retains any existing clip and other draft fields

#### Scenario: Leave the foreground during capture
- **WHEN** the recording screen loses focus or the app enters the background during capture
- **THEN** capture stops, the unfinished recording is discarded, and the preceding editor draft is retained where the editor remains open

### Requirement: Transactional pronunciation drafts
The editor SHALL apply audio changes only as part of a successful term save, including on creation. Audio changes SHALL participate in existing draft validation, dirty-exit, and category subflow behavior. Confirmed term or collection deletion SHALL remove the corresponding clips in the same transaction.

#### Scenario: Save a replacement recording
- **WHEN** a user previews a replacement and saves the term
- **THEN** the new clip is associated with that term after restart and replaces the previous clip

#### Scenario: Keep or discard audio edits
- **WHEN** a user leaves the editor with an unsaved recording or removal
- **THEN** Keep editing preserves the draft and Discard changes preserves the prior stored term and clip

#### Scenario: Save fails or validation blocks it
- **WHEN** validation blocks Save or a write fails after the user changes a clip
- **THEN** persisted data remains unchanged and the editor keeps the completed audio draft alongside the text and category selections for retry

#### Scenario: Manage categories with an audio draft
- **WHEN** the user navigates to category management with a completed draft clip and returns
- **THEN** the clip is still available for preview and remains uncommitted

#### Scenario: Delete a term or its collection
- **WHEN** a user confirms deletion of a term or its owning collection
- **THEN** the associated clips are removed atomically with the affected terms

### Requirement: Play saved pronunciation
Term details SHALL offer a localized accessible play/stop control when a saved clip exists. Playback SHALL start on user action, return the control to its ready state on completion, and provide recovery on failure without affecting stored data. Details SHALL omit the optional audio section for terms without clips.

#### Scenario: Play saved pronunciation offline
- **WHEN** a user opens a term with a saved clip and taps Play in airplane mode
- **THEN** the term's clip plays from the beginning and can be stopped or replayed

#### Scenario: Save clip removal
- **WHEN** a user removes a term's clip in the editor and saves
- **THEN** reopening details shows the term without an audio section
