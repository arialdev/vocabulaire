import { Pressable, StyleSheet, Text } from "react-native";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function ActionButton({ label, onPress, disabled = false }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: "#2352b8", borderRadius: 8, padding: 14 },
  label: { color: "#fff", fontWeight: "600", textAlign: "center" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});
