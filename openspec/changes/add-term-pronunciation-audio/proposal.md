## Why

Written vocabulary cannot capture how a word or phrase sounds. A short, offline recording lets users preserve and replay the pronunciation they want to learn.

## What Changes

- Let users record, preview, replace, or remove one optional pronunciation clip in the term editor, and replay saved clips from term details.
- Stop recording automatically after 7 seconds. Ask for microphone access when the user starts recording.
- Include clips in version 2 JSON backups. Accept existing version 1 backups as datasets without clips. **BREAKING for older readers** — app versions that support only version 1 cannot restore version 2 exports.

## Capabilities

### New Capabilities

- `term-pronunciation-audio` covers offline capture, playback, and the lifecycle of a term's optional clip.

### Modified Capabilities

- `data-portability` adds pronunciation clips to backup snapshots and defines validation and compatibility for restores.

## Impact

Term editor and details, Android microphone permissions and native build, Expo Audio, SQLite persistence, backup validation and documentation, English and Spanish copy, and the Stitch handoff and Android acceptance flows.
