import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button, Modal } from "react-native";
import { Text, View } from "./theme";
import EmojiPicker from "../../modules/emoji-picker";

export function EmojiControl({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button title={`${label}: ${value}`} onPress={() => setVisible(true)} />
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text>{label}</Text>
          <EmojiPicker
            language={i18n.resolvedLanguage ?? "en"}
            style={{ flex: 1 }}
            onEmojiPicked={(event) => {
              onChange(event.nativeEvent.emoji);
              setVisible(false);
            }}
          />
          <Button title={t("Cancel")} onPress={() => setVisible(false)} />
        </View>
      </Modal>
    </>
  );
}
