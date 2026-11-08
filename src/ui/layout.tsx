import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View } from "./theme";
import { NotebookText } from "./typography";
import { IconButton } from "./controls";
import { useKeyboardInset } from "./use-keyboard-inset";

/** Content and footer share one scroll owner, allowing large text and the IME to expand naturally. */
export function ScreenLayout({
  children,
  footer,
  topInset = true,
}: {
  children: ReactNode;
  footer?: ReactNode;
  topInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardInset();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: topInset ? insets.top : 0 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: Math.max(insets.bottom, 24) + keyboardInset,
            gap: 16,
          }}
        >
          <View style={{ flexGrow: 1, gap: 16 }}>{children}</View>
          {footer}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
export function AppBar({
  title,
  onBack,
  trailing,
  backLabel,
}: {
  title: string;
  onBack?: () => void;
  trailing?: ReactNode;
  backLabel: string;
}) {
  return (
    <View style={{ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8 }}>
      {onBack && <IconButton name="back" label={backLabel} onPress={onBack} />}
      <NotebookText variant="headword" emphasis style={{ flex: 1 }}>
        {title}
      </NotebookText>
      {trailing}
    </View>
  );
}
