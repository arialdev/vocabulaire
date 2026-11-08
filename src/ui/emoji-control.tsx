import { useReducedMotion } from "./use-reduced-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Pressable,
  View as NativeView,
} from "react-native";
import { Text, View, useTheme } from "./theme";
import { ActionButton } from "./action-button";
import { NotebookText } from "./typography";
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
  const [pending, setPending] = useState(value);
  const opener = useRef<React.ElementRef<typeof NativeView>>(null);
  const heading = useRef<React.ElementRef<typeof NativeView>>(null);
  const restoreFrame = useRef<number | undefined>(undefined);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => {
      const handle = findNodeHandle(heading.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    });
    return () => cancelAnimationFrame(frame);
  }, [visible]);
  useEffect(
    () => () => {
      if (restoreFrame.current != null) cancelAnimationFrame(restoreFrame.current);
    },
    [],
  );
  const close = () => {
    setVisible(false);
    restoreFrame.current = requestAnimationFrame(() => {
      const handle = findNodeHandle(opener.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    });
  };
  return (
    <>
      <Pressable
        ref={opener}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        onPress={() => {
          setPending(value);
          setVisible(true);
        }}
        style={{
          minHeight: 56,
          borderRadius: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.selected,
        }}
      >
        <NotebookText>
          {label}: {value}
        </NotebookText>
      </Pressable>
      <Modal
        visible={visible}
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={close}
      >
        <View
          accessibilityViewIsModal
          style={{ flex: 1, padding: 24, gap: 12, backgroundColor: theme.surface }}
        >
          <Pressable ref={heading} accessible accessibilityRole="header">
            <NotebookText variant="section" emphasis>
              {label}
            </NotebookText>
          </Pressable>
          <EmojiPicker
            key={`${theme.mode}-${i18n.resolvedLanguage ?? "en"}`}
            language={i18n.resolvedLanguage ?? "en"}
            appearance={theme.mode}
            style={{ flex: 1 }}
            onEmojiPicked={(event) => setPending(event.nativeEvent.emoji)}
          />
          <Text accessibilityLiveRegion="polite">{pending}</Text>
          <ActionButton
            label={t("Apply emoji")}
            onPress={() => {
              onChange(pending);
              close();
            }}
          />
          <ActionButton label={t("Cancel")} variant="secondary" onPress={close} />
        </View>
      </Modal>
    </>
  );
}
