# Concept A · Inline pronunciation recorder

Use only the Concept A frames in the reference table below. Stitch retains the rejected explorations under titles beginning with **DISCARDED**. Ignore Concept B (recorder sheet), Concept C (focused recorder), and the initial Concept A review frame with the earlier time limit.

Use the inline recorder for Add term and Edit term. Place the optional Pronunciation section after Translation and before Notes. Preserve the standard scrolling editor and safe-area Save term footer. Controls use the existing Field Notebook tokens, with 48 dp targets and wrapping or stacking at 320 dp and up to 200% text scaling.

## Editor states

| State | Visible treatment and interaction |
| --- | --- |
| No clip | Pronunciation heading, “Up to 7 seconds” and a secondary Record button. Record requests Android microphone access if needed. |
| Recording | Live “Recording” label and elapsed time out of 0:07. Stop recording finishes early. At seven seconds the recorder stops automatically. Disable Save and competing audio actions during capture. |
| Finalizing | Keep the form visible. Replace Stop with a brief “Finishing recording…” status and leave Save disabled until completion. |
| Draft ready | Show the clip duration, Play, Record again, and Remove. Show “Saved when you save the term.” A replacement capture keeps the previous clip available until the new one finishes successfully. |
| Saved clip in editor | Show the same playback and management controls. Omit the unsaved hint until the user changes the audio. |
| Draft removal | Return to the no-clip controls and show “Recording will be removed when you save.” Keep the original clip in storage until Save succeeds. |
| Permission denied | Show an inline explanation. Offer retry when Android allows another prompt and Open Settings when it does not. Preserve form values and any earlier clip. Returning from Settings rechecks permission without auto-starting capture. |
| Capture or playback failure | Show a localized inline error and retry action near the affected control. Preserve the previous usable clip and all other draft values. |

Only Save term commits changes. A finished clip survives category management and a failed save. Leaving during capture stops and discards the unfinished take. For a dirty exit, reuse Keep editing / Discard changes, including audio-only edits. Backgrounding or leaving details stops playback. Announce state transitions and errors to TalkBack and keep per-second timer updates out of live announcements.

## Term details and backups

Put the Pronunciation row after the translation when a saved clip exists. Show its duration with Play, change Play to Stop during playback, and return to Play on completion. Display playback failure inline with retry. The existing Edit term action remains primary.

Show the number of pronunciation recordings in the validated restore preview alongside the existing summary counts, including zero for a version 1 backup. Preserve the separate replace confirmation. Use the existing backup failure pattern for oversized exports and invalid audio payloads. Localize all visible copy and accessibility labels in English and Spanish.

The seven-second cap applies to capture and to version 2 backup validation. Wire format, data lifecycle and acceptance requirements are in the sibling design and specs.

## Stitch references

The paired PNG and HTML exports are registered as screens 54–60 in the [review gallery](../../../design/vocabulaire/index.html#54).

| State | Light | Dark |
| --- | --- | --- |
| Add term · idle | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=699c54a2488e4d9fad7e2f1467cccaf2) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=87f1ddd275254461a58e49607a62a050) |
| Edit term · recording | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=ea1413acb0b04d6f99401c6fde495956) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=47cb60c707334496aeba0504fb864b2a) |
| Edit term · draft ready | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=2f17e30b213349ed93f3e5a65e115e9f) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=f7ec2d1477f243ecb8c09853e65b4ad2) |
| Edit term · permission denied | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=f13bd537c3b8463a8482724d427573b9) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=d8e2da0b5d1a4284a9bc8d5551a73bd6) |
| Edit term · recording failed | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=fa27ef02a296496dad97e0cba62a0f81) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=4b461eb0e9004192a8f141bb6f3cdf37) |
| Term details · saved clip | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=598895d972ea4413baf17d3327ddc713) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=98cf70adb0154a0381fc60107929ab01) |
| Restore preview · clip count | [Light](https://stitch.google.com/projects/8226357890556052909?node-id=1c3cdaa93a694455861b9243fc6c56f2) | [Dark](https://stitch.google.com/projects/8226357890556052909?node-id=c60c553e5e4f40ffadf8b57063f6c399) |

Use the state table above for transient states and behaviors that static artboards cannot express. The first review frame used an earlier time limit. Use the references in this table for implementation.

Additional Stitch states were generated for finishing, removal, playback failure, discard, validation and oversized backup. Their local PNG and HTML exports are available in gallery screens 61–66. The discard and oversized backup revisions supersede the first generated versions. The corrected references are [discard light](https://stitch.google.com/projects/8226357890556052909?node-id=a74a6153761c437e84adf655b1036795), [discard dark](https://stitch.google.com/projects/8226357890556052909?node-id=567446fbd63d4f19a9df6e15c3baf5fb), [backup error light](https://stitch.google.com/projects/8226357890556052909?node-id=dd88824d7d5244b8963b7483136c5ac4), and [backup error dark](https://stitch.google.com/projects/8226357890556052909?node-id=178697f9712e4f5ab1ad25a96a2f2187).

Android comparisons, native adaptations, device results and verification limits are recorded in [verification.md](verification.md).
