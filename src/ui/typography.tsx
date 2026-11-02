import { createContext, useContext, type ReactNode } from "react";
import { Text as NativeText, type TextProps } from "react-native";
import { typography } from "./tokens";
import { useTheme } from "./theme";

const FontsContext = createContext(false);
export function FontsProvider({ ready, children }: { ready: boolean; children: ReactNode }) {
  return <FontsContext.Provider value={ready}>{children}</FontsContext.Provider>;
}
export function useBundledFonts() {
  return useContext(FontsContext);
}

type TextVariant = keyof typeof typography;
export function NotebookText({
  variant = "body",
  emphasis = false,
  style,
  ...props
}: TextProps & { variant?: TextVariant; emphasis?: boolean }) {
  const fonts = useBundledFonts();
  const theme = useTheme();
  const serif = variant === "display" || variant === "pageTitle" || variant === "headword";
  const family = serif
    ? emphasis
      ? "EBGaramondSemiBold"
      : "EBGaramondRegular"
    : emphasis
      ? "DMSansSemiBold"
      : "DMSansRegular";
  return (
    <NativeText
      {...props}
      style={[typography[variant], { color: theme.text }, fonts && { fontFamily: family }, style]}
    />
  );
}

const glyphs = {
  back: "\ue5c4",
  close: "\ue5cd",
  more: "\ue5d4",
  search: "\ue8b6",
  add: "\ue145",
  settings: "\ue8b8",
  edit: "\ue3c9",
  delete: "\ue872",
  check: "\ue5ca",
  daily: "\ue430",
  categories: "\ue574",
  pdf: "\ue415",
} as const;
const fallbackGlyphs: Record<keyof typeof glyphs, string> = {
  back: "←",
  close: "×",
  more: "⋮",
  search: "⌕",
  add: "+",
  settings: "⚙",
  edit: "✎",
  delete: "×",
  check: "✓",
  daily: "☼",
  categories: "◇",
  pdf: "▤",
};
export type IconName = keyof typeof glyphs;
export function Icon({
  name,
  size = 24,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const theme = useTheme();
  const fonts = useBundledFonts();
  return (
    <NativeText
      accessible={false}
      style={{
        fontFamily: fonts ? "MaterialSymbols" : undefined,
        fontSize: size,
        color: color ?? theme.text,
      }}
    >
      {fonts ? glyphs[name] : fallbackGlyphs[name]}
    </NativeText>
  );
}
