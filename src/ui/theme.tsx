import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  Appearance,
  ScrollView as NativeScrollView,
  Text as NativeText,
  TextInput as NativeTextInput,
  View as NativeView,
  type ScrollViewProps,
  type TextInputProps,
  type TextProps,
  type ViewProps,
  useColorScheme,
} from "react-native";

type Theme = { background: string; foreground: string; border: string };
const light: Theme = { background: "#ffffff", foreground: "#171717", border: "#555555" };
const dark: Theme = { background: "#171717", foreground: "#f5f5f5", border: "#bbbbbb" };
const ThemeContext = createContext<Theme>(light);
export function ThemeProvider({
  appearance,
  children,
}: {
  appearance: "system" | "light" | "dark";
  children: ReactNode;
}) {
  const system = useColorScheme();
  useEffect(() => {
    Appearance.setColorScheme(appearance === "system" ? "unspecified" : appearance);
  }, [appearance]);
  return (
    <ThemeContext.Provider
      value={(appearance === "system" ? system : appearance) === "dark" ? dark : light}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
export function Text(props: TextProps) {
  const theme = useTheme();
  return <NativeText {...props} style={[{ color: theme.foreground }, props.style]} />;
}
export function TextInput(props: TextInputProps) {
  const theme = useTheme();
  return (
    <NativeTextInput
      {...props}
      placeholderTextColor={theme.border}
      style={[{ color: theme.foreground, borderColor: theme.border }, props.style]}
    />
  );
}
export function View(props: ViewProps) {
  const theme = useTheme();
  return <NativeView {...props} style={[{ backgroundColor: theme.background }, props.style]} />;
}
export function ScrollView(props: ScrollViewProps) {
  const theme = useTheme();
  return (
    <NativeScrollView {...props} style={[{ backgroundColor: theme.background }, props.style]} />
  );
}
