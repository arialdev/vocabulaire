## Context

The Android notebook stores term data in SQLite and exports a transactional snapshot as version 1 JSON. The term editor already has Save, validation, a dirty-exit confirmation, and a category-management subflow. The backup picker caps JSON input at 25 MiB.

## Goals / Non-Goals

Capture short personal pronunciation clips, save them with the term, and preserve them through offline backup and restore. Scope playback to the term details and editor preview, including access from Word of the Day through its existing Open term action.

## Decisions

- Use the selected [inline recorder handoff](stitch-handoff.md) for placement, visual states, and interaction details.
- Use the SDK-compatible `expo-audio` package, its Android recording permission APIs, recorder and player lifecycle APIs, and native duration limit. Capture mono AAC in an MPEG-4 audio container (.m4a) at a target 48 kbps, with a 7-second limit and a 128 KiB encoded clip limit. Request microphone access on Record and keep capture and playback foreground-only. Use the app's normal Android development build. [Expo Audio SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/sdk/audio/)
- Keep one clip per term in a dedicated SQLite table keyed by term and collection, with a composite cascading foreign key to the term. Store bytes as a BLOB and store the measured duration in milliseconds. Fetch the payload only for editing, playback, and backup. A separate table keeps audio out of list and search queries and allows clip saves, deletes, and restores to participate in the existing transactions. Durable sidecar files would require coordinating file replacement and rollback with SQLite.
- Keep a finished capture as an editor draft. Preview it from the draft and apply replacement or removal only when Save succeeds. Retain the draft across failed writes and category management, and use the existing discard guard for audio-only changes. Stop media on route blur or app backgrounding, discard unfinished captures, ignore stale callbacks, and release player/recorder resources. Use app-controlled cache files for native recording and playback, clean them up when no longer needed, and prune abandoned audio cache files on cold start. Persist no URI in SQLite or backup data.
- Export version 2 with a required `data.termAudio` array. Each item contains `collectionId`, `termId`, `durationMs`, and `audioBase64` with canonical base64 encoding of the AAC/M4A bytes. Version 1 normalizes to an empty clip array. Validate clip references, uniqueness, declared duration, canonical encoding, decoded size, and bounded container/codec structure before presenting confirmation. Verify the container duration against the declared duration, allowing for the documented rounding tolerance of the recorder. Generate exports within the same 25 MiB UTF-8 JSON budget used by restore, with a preflight before encoding a large snapshot and a final serialized-size check before preparing the file. Provide localized recovery when the dataset exceeds the budget.
- Reuse the existing replacement preview and confirmation flow, with a localized clip count. Insert clips after their owning terms inside the replacement transaction. The existing post-restore reset must release stale media state even when a restored term reuses a previous ID.

## Risks / Trade-offs

- Base64 expands audio by roughly a third. The existing backup size budget can be reached sooner in audio-heavy notebooks. Oversized exports report the limit and recovery without producing a partial file. Check memory use near the limit on Android.
- Android can deny microphone access, interrupt capture, or fail to finalize a very short recording. Keep the previous draft and saved clip available and offer retry or Settings when appropriate. Verify the recorder cutoff, payload limits, and playback against actual Android output before signing off.
- Cache files can be evicted. Rematerialize saved audio from SQLite on demand and surface a recoverable error if the device cannot prepare playback.

## Migration Plan

Install the Expo-compatible dependency, regenerate the Android build, and apply a generated additive Drizzle migration. Existing terms start without audio. Keep the version 1 reader and document that version 2 exports require a reader with version 2 support.

The active field-notebook change contains earlier requirements for term details without audio controls and version 1 backup export. During implementation, reconcile those two clauses in the active change if it is still open. If it has been archived, add corresponding deltas against the promoted notebook specs. Update the Stitch handoff and its coverage records for the affected states.
