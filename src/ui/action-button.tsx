import { forwardRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View as NativeView } from "react-native";
import { useTheme } from "./theme";
import { useBundledFonts } from "./typography";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "primary" | "secondary" | "destructive";
  testID?: string;
};

export const ActionButton = forwardRef<React.ElementRef<typeof NativeView>, ActionButtonProps>(
  function ActionButton(
    {
      label,
      onPress,
      disabled = false,
      busy = false,
      variant = "primary",
      testID,
    }: ActionButtonProps,
    ref,
  ) {
    const theme = useTheme();
    const fonts = useBundledFonts();
    const unavailable = disabled || busy;
    const primary = variant === "primary";
    const destructive = variant === "destructive";
    const color = destructive
      ? theme.mode === "dark"
        ? "#3A0909"
        : "#FFFFFF"
      : primary
        ? theme.onPrimary
        : theme.text;
    return (
      <Pressable
        ref={ref}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: unavailable, busy }}
        disabled={unavailable}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: destructive
              ? theme.destructive
              : primary
                ? theme.primary
                : theme.selected,
          },
          unavailable && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={color} />
        ) : (
          <Text style={[styles.label, { color }, fonts && { fontFamily: "DMSansSemiBold" }]}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  },
);
const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 16, lineHeight: 24, fontWeight: "600", textAlign: "center" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});
