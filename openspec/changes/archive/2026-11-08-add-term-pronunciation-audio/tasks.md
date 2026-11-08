## 0. Stitch design review

- [x] 0.1 Generate distinct pronunciation recording proposals from the existing Edit term design in the Vocabulaire Stitch project and share the frames for review.
- [x] 0.2 Record the user's choice. Concept A is selected with a seven-second maximum. Concepts B and C are excluded from the implementation handoff.
- [x] 0.3 Complete the selected [design handoff](stitch-handoff.md) for a later implementation pass. Label the two rejected Stitch artboards DISCARDED and exclude them from the implementation references.

## 1. Contracts and Android setup

- [x] 1.1 Reconcile the term-details and backup-export requirements in the active field-notebook change or add deltas if its specs have been promoted. Use the selected handoff's light and dark Stitch frames as the baseline and finish any affected confirmation, validation, or error artboards needed for Android comparison.
- [x] 1.2 Synchronize the selected Concept A Stitch PNG/HTML exports, including the additional transient and error states, screen references, review gallery, and design and flow documentation.
- [x] 1.3 Install SDK-compatible `expo-audio` with Expo's installer, configure foreground microphone recording, run Expo dependency compatibility checks, and verify the recording format, duration cutoff, and payload bound on an Android development build.

## 2. Audio lifecycle and persistence

- [x] 2.1 Add the collection-scoped audio table, generate the Drizzle migration, and add payload-on-demand queries and atomic clip changes to term saves and cascaded deletes.
- [x] 2.2 Implement foreground capture and playback using Expo Audio, including permission recovery, lifecycle and duplicate-action guards, and cleanup of transient files and media resources.
- [x] 2.3 Add recording, preview, replacement, and removal to the editor with the existing save and discard lifecycle. Add saved playback to term details and localize labels, accessibility text, and recoverable errors in English and Spanish.

## 3. Backup portability

- [x] 3.1 Add version 2 snapshot encoding, version 1 compatibility, bounded audio and reference validation, and symmetric backup size enforcement with localized recovery. Document the wire format in `BACKUP-FORMAT.md`.
- [x] 3.2 Add the restore preview clip count, insert audio in the existing replacement transaction, and clear stale media sessions after successful restore.

## 4. Verification

- [x] 4.1 Add focused Jest coverage for migration, collection ownership, draft recovery, cascading deletion, valid and invalid backups, v1 replacement, v2 byte-for-byte round trips, size bounds, and rollback after an audio write failure. Run lint, format check, typecheck, and Jest.
- [x] 4.2 Run affected Maestro flows on disposable Android, including capture, permission denial, dirty exit, playback, and backup preview. Verify audible recording and playback, interruption and duration cutoff, and standalone airplane-mode cold start and backup/share/restore.
- [x] 4.3 Compare the running Android screens with Stitch in both appearances, including narrow layouts and large text. Record screen references, native adaptations, command results, and emulator or device verification limits in the OpenSpec handoff.
