import { forwardRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput as NativeTextInput,
  type TextInputProps,
} from "react-native";
import { Text, TextInput, View, useTheme } from "./theme";
import { Icon, NotebookText, type IconName } from "./typography";

export function MenuAction({
  name,
  label,
  onPress,
  destructive = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const theme = useTheme();
  const color = destructive ? theme.destructive : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 8,
      }}
    >
      <Icon name={name} color={color} />
      <NotebookText style={{ flex: 1, color }}>{label}</NotebookText>
      <Text accessible={false} style={{ fontSize: 24, color: theme.secondaryText }}>
        ›
      </Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
  disabled = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minWidth: 48,
        minHeight: 48,
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon name={name} />
    </Pressable>
  );
}
export const Field = forwardRef<
  React.ElementRef<typeof NativeTextInput>,
  TextInputProps & { label: string; error?: string }
>(function Field({ label, error, style, ...props }, ref) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <NotebookText emphasis>{label}</NotebookText>
      <TextInput
        {...props}
        ref={ref}
        accessibilityLabel={props.accessibilityLabel ?? label}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          {
            minHeight: 56,
            borderWidth: focused ? 2 : 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: theme.input,
            borderColor: error ? theme.destructive : focused ? theme.primary : theme.controlOutline,
            fontSize: 16,
          },
          style,
        ]}
      />
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: theme.destructive }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});
export function RadioOption({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <NotebookText style={{ color: theme.primary }}>{selected ? "◉" : "○"}</NotebookText>
      <NotebookText>{label}</NotebookText>
    </Pressable>
  );
}
export function CategoryChip({
  label,
  kind,
  selected,
  onPress,
}: {
  label: string;
  kind: "grammatical" | "thematic";
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const foreground = kind === "grammatical" ? theme.grammaticalText : theme.thematicText;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={{ minHeight: 48, justifyContent: "center" }}
    >
      <View
        style={{
          borderRadius: 12,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? foreground : theme.controlOutline,
          backgroundColor: kind === "grammatical" ? theme.grammaticalFill : theme.thematicFill,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
      >
        <NotebookText variant="secondary" style={{ color: foreground }}>
          {selected ? "✓ " : ""}
          {kind === "grammatical" ? "Aa" : "♧"} {label}
        </NotebookText>
      </View>
    </Pressable>
  );
}
export function Feedback({
  message,
  error = false,
  busy = false,
}: {
  message: string;
  error?: boolean;
  busy?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole={error ? "alert" : undefined}
      accessibilityLiveRegion="polite"
      style={{
        borderRadius: 12,
        padding: 16,
        backgroundColor: error ? theme.errorSurface : theme.selected,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
      }}
    >
      {busy && <ActivityIndicator color={theme.primary} />}
      <NotebookText style={{ color: error ? theme.destructive : theme.text, flexShrink: 1 }}>
        {message}
      </NotebookText>
    </View>
  );
}
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <View style={{ alignItems: "center", gap: 12, paddingVertical: 24 }}>
      <NotebookText variant="section" emphasis style={{ textAlign: "center" }}>
        {title}
      </NotebookText>
      <NotebookText style={{ textAlign: "center" }}>{message}</NotebookText>
      {action}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityLabel={option.label}
          accessibilityState={{ checked: value === option.value }}
          onPress={() => onChange(option.value)}
          style={{
            minHeight: 48,
            justifyContent: "center",
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: value === option.value ? theme.primary : theme.controlOutline,
            backgroundColor: value === option.value ? theme.selected : theme.surface,
          }}
        >
          <NotebookText>{option.label}</NotebookText>
        </Pressable>
      ))}
    </View>
  );
}
