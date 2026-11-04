import { Directory, File, Paths } from 'expo-file-system';

/** Remove only temporary files created by pronunciation recording and playback. */
export function cleanPronunciationCache() {
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof File && entry.name.startsWith('pronunciation-play-')) entry.delete();
    }
    const recordings = new Directory(Paths.cache, 'Audio');
    if (recordings.exists) {
      for (const entry of recordings.list()) {
        if (entry instanceof File && entry.name.startsWith('pronunciation-record-')) entry.delete();
      }
    }
  } catch {
    // Cache cleanup is best effort and must not prevent startup.
  }
}
