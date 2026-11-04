import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type AudioPlayer,
  type RecordingStatus,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { recordedAudioDuration } from '../../platform/pronunciation-format';

export type PronunciationClip = { audio: Uint8Array; durationMs: number };

export function usePronunciation(initial?: PronunciationClip) {
  const [clip, setClip] = useState<PronunciationClip | null>(initial ?? null);
  const [changed, setChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<'permission' | 'settings' | 'record' | 'play' | null>(null);
  const active = useRef(false);
  const locked = useRef(false);
  const generation = useRef(0);
  const requestingPermission = useRef(false);
  const player = useRef<AudioPlayer | null>(null);
  const playerFile = useRef<File | null>(null);
  const listener = useRef<(status: RecordingStatus) => void>(() => {});
  const recorder = useAudioRecorder(
    {
      ...RecordingPresets.HIGH_QUALITY,
      numberOfChannels: 1,
      bitRate: 48000,
      android: { ...RecordingPresets.HIGH_QUALITY.android, maxFileSize: 131072 },
    },
    (status) => listener.current(status),
  );
  const recorderState = useAudioRecorderState(recorder, 250);

  const stopPlayer = useCallback(() => {
    player.current?.remove();
    player.current = null;
    try {
      playerFile.current?.delete();
    } catch {
      /* Cache may already be gone. */
    }
    playerFile.current = null;
    setPlaying(false);
  }, []);

  const discardCapture = useCallback(() => {
    generation.current++;
    const wasActive = active.current;
    active.current = false;
    setRecording(false);
    setBusy(false);
    setFinishing(false);
    locked.current = false;
    stopPlayer();
    if (wasActive)
      void recorder
        .stop()
        .catch(() => {})
        .finally(() => {
          if (recorder.uri) {
            try {
              new File(recorder.uri).delete();
            } catch {
              /* Cache may already be gone. */
            }
          }
        });
  }, [recorder, stopPlayer]);

  useFocusEffect(useCallback(() => () => discardCapture(), [discardCapture]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !requestingPermission.current) discardCapture();
    });
    return () => subscription.remove();
  }, [discardCapture]);

  useEffect(() => {
    listener.current = (status) => {
      if (!status.isFinished || !active.current) return;
      active.current = false;
      setRecording(false);
      setBusy(true);
      setFinishing(true);
      const token = generation.current;
      const uri = status.url ?? recorder.uri;
      void (async () => {
        try {
          if (status.hasError || !uri) throw new Error('Recording failed');
          const file = new File(uri);
          const bytes = await file.bytes();
          const durationMs = recordedAudioDuration(bytes);
          if (token === generation.current) {
            setClip({ audio: bytes, durationMs });
            setChanged(true);
            setError(null);
          }
        } catch {
          if (token === generation.current) setError('record');
        } finally {
          if (uri) {
            try {
              new File(uri).delete();
            } catch {
              /* Cache may already be gone. */
            }
          }
          if (token === generation.current) {
            locked.current = false;
            setBusy(false);
            setFinishing(false);
          }
        }
      })();
    };
  }, [recorder]);

  const start = async () => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    const token = generation.current;
    try {
      stopPlayer();
      requestingPermission.current = true;
      let permission;
      try {
        permission = await requestRecordingPermissionsAsync();
      } finally {
        requestingPermission.current = false;
      }
      if (token !== generation.current) return;
      if (!permission.granted) {
        setError(permission.canAskAgain ? 'permission' : 'settings');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync({
        ...RecordingPresets.HIGH_QUALITY,
        fileName: `pronunciation-record-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        numberOfChannels: 1,
        bitRate: 48000,
        android: { ...RecordingPresets.HIGH_QUALITY.android, maxFileSize: 131072 },
      });
      if (token !== generation.current) {
        await recorder.stop().catch(() => {});
        if (recorder.uri) {
          try {
            new File(recorder.uri).delete();
          } catch {}
        }
        return;
      }
      active.current = true;
      recorder.record({ forDuration: 7 });
      setRecording(true);
    } catch {
      active.current = false;
      if (token === generation.current) setError('record');
    } finally {
      if (token === generation.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };
  const stop = async () => {
    if (!active.current || locked.current) return;
    locked.current = true;
    setBusy(true);
    setFinishing(true);
    try {
      await recorder.stop();
    } catch {
      active.current = false;
      setRecording(false);
      setError('record');
      locked.current = false;
      setBusy(false);
      setFinishing(false);
    }
  };
  const play = async () => {
    if (!clip || locked.current) return;
    if (player.current) {
      stopPlayer();
      return;
    }
    locked.current = true;
    const token = generation.current;
    try {
      setError(null);
      const file = new File(
        Paths.cache,
        `pronunciation-play-${Date.now()}-${Math.random().toString(36).slice(2)}.m4a`,
      );
      playerFile.current = file;
      await file.write(clip.audio);
      if (token !== generation.current) {
        try {
          file.delete();
        } catch {}
        return;
      }
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (token !== generation.current) return;
      const current = createAudioPlayer(file.uri);
      player.current = current;
      current.addListener('playbackStatusUpdate', (status) => {
        if (status.error) {
          stopPlayer();
          setError('play');
        } else if (status.didJustFinish) stopPlayer();
      });
      current.play();
      setPlaying(true);
    } catch {
      stopPlayer();
      if (token === generation.current) setError('play');
    } finally {
      locked.current = false;
    }
  };
  const remove = () => {
    stopPlayer();
    setClip(null);
    setChanged(true);
    setError(null);
  };
  return {
    clip,
    changed,
    recording,
    busy,
    finishing,
    playing,
    error,
    elapsed: recorderState.durationMillis,
    start,
    stop,
    play,
    remove,
  };
}
