import { createContext, forwardRef, useContext, useEffect, type ReactNode } from "react";
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

import { darkTheme, lightTheme, type Theme } from "./tokens";

const ThemeContext = createContext<Theme>(lightTheme);
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
      value={(appearance === "system" ? system : appearance) === "dark" ? darkTheme : lightTheme}
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
  return <NativeText {...props} style={[{ color: theme.text }, props.style]} />;
}
export const TextInput = forwardRef<React.ElementRef<typeof NativeTextInput>, TextInputProps>(
  function TextInput(props, ref) {
    const theme = useTheme();
    return (
      <NativeTextInput
        {...props}
        ref={ref}
        placeholderTextColor={props.placeholderTextColor ?? theme.secondaryText}
        style={[{ color: theme.text, borderColor: theme.controlOutline }, props.style]}
      />
    );
  },
);
export function View(props: ViewProps) {
  const theme = useTheme();
  return <NativeView {...props} style={[{ backgroundColor: theme.canvas }, props.style]} />;
}
export function ScrollView(props: ScrollViewProps) {
  const theme = useTheme();
  return <NativeScrollView {...props} style={[{ backgroundColor: theme.canvas }, props.style]} />;
}
