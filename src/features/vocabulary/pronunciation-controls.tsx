import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../../ui/action-button";
import { Text, View, useTheme } from "../../ui/theme";
import { usePronunciation, type PronunciationClip } from "./use-pronunciation";

export function PronunciationPlayer({ clip }: { clip?: PronunciationClip }) {
  const audio = usePronunciation(clip);
  return <PronunciationControls audio={audio} />;
}

type Props = { audio: ReturnType<typeof usePronunciation>; editor?: boolean };
export function PronunciationControls({ audio, editor = false }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!editor && !audio.clip) return null;
  const seconds = Math.min(7, Math.floor(audio.elapsed / 1000));
  return (
    <View
      style={{
        gap: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.divider,
        backgroundColor: theme.surface,
      }}
    >
      <Text>{t("Pronunciation")}</Text>
      {audio.finishing ? (
        <Text accessibilityLiveRegion="polite">{t("Finishing recording…")}</Text>
      ) : audio.recording ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", backgroundColor: "transparent" }}>
          <Text accessibilityLiveRegion="polite">{t("Recording")}</Text>
          <Text accessibilityElementsHidden importantForAccessibility="no">
            {" · "}0:0{seconds} / 0:07
          </Text>
        </View>
      ) : audio.clip ? (
        <Text>{(audio.clip.durationMs / 1000).toFixed(1)} s</Text>
      ) : (
        <Text>{t("Up to 7 seconds")}</Text>
      )}
      {audio.error && (
        <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
          {t(
            audio.error === "permission" || audio.error === "settings"
              ? "Microphone access is needed."
              : audio.error === "play"
                ? "Could not play this recording."
                : "Could not record. Please try again.",
          )}
        </Text>
      )}
      {audio.error === "settings" && (
        <ActionButton
          label={t("Open settings")}
          variant="secondary"
          onPress={() => void Linking.openSettings()}
        />
      )}
      {audio.clip && !audio.recording && (
        <ActionButton
          label={t(audio.playing ? "Stop playback" : "Play pronunciation")}
          variant="secondary"
          disabled={audio.busy}
          onPress={() => void audio.play()}
        />
      )}
      {editor && (
        <ActionButton
          label={t(
            audio.recording
              ? "Stop recording"
              : audio.clip
                ? "Record again"
                : "Record pronunciation",
          )}
          variant="secondary"
          disabled={audio.busy}
          onPress={() => void (audio.recording ? audio.stop() : audio.start())}
        />
      )}
      {editor && audio.clip && !audio.recording && (
        <ActionButton
          label={t("Remove recording")}
          variant="secondary"
          disabled={audio.busy}
          onPress={audio.remove}
        />
      )}
      {editor && audio.changed && (
        <Text>
          {t(
            audio.clip
              ? "Saved when you save the term."
              : "Recording will be removed when you save.",
          )}
        </Text>
      )}
    </View>
  );
}
