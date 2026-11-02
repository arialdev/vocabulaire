import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View, useTheme } from "../ui/theme";
import { NotebookText } from "../ui/typography";
import { ActionButton } from "../ui/action-button";
import { AppBar } from "../ui/layout";
import { lightTheme, darkTheme } from "../ui/tokens";
import { useServices } from "../data/services";
import i18n, { resolveLanguage } from "../i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { repository, revision, refresh } = useServices();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState(false);
  void revision;
  const prefs = repository.getPreferences();
  const selectLanguage = (locale: "system" | "en" | "es") => {
    try {
      repository.updatePreferences({ locale });
      void i18n.changeLanguage(resolveLanguage(locale));
      setError(false);
      refresh();
    } catch {
      setError(true);
    }
  };
  const selectAppearance = (appearance: "system" | "light" | "dark") => {
    try {
      repository.updatePreferences({ appearance });
      setError(false);
      refresh();
    } catch {
      setError(true);
    }
  };
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 12 }}>
        <AppBar title={t("settings")} onBack={() => router.back()} backLabel={t("Back")} />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom, 24), gap: 16 }}
      >
        <NotebookText variant="section" emphasis>
          {t("language")}
        </NotebookText>
        {(["system", "en", "es"] as const).map((locale) => {
          const selected = prefs.locale === locale;
          return (
            <Pressable
              key={locale}
              accessibilityRole="radio"
              accessibilityLabel={
                locale === "es" ? "Español" : t(locale === "en" ? "english" : "system")
              }
              accessibilityState={{ checked: selected }}
              onPress={() => selectLanguage(locale)}
              style={{
                minHeight: 52,
                borderWidth: 1,
                borderRadius: 12,
                borderColor: selected ? theme.primary : theme.controlOutline,
                backgroundColor: selected ? theme.selected : theme.surface,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text>{selected ? "◉" : "○"}</Text>
              <NotebookText>
                {locale === "es" ? "Español" : t(locale === "en" ? "english" : "system")}
              </NotebookText>
            </Pressable>
          );
        })}
        <NotebookText variant="section" emphasis>
          {t("appearance")}
        </NotebookText>
        {(["system", "light", "dark"] as const).map((appearance) => {
          const selected = prefs.appearance === appearance;
          const preview =
            appearance === "system" ? theme : appearance === "light" ? lightTheme : darkTheme;
          return (
            <Pressable
              key={appearance}
              accessibilityRole="radio"
              accessibilityLabel={t(appearance)}
              accessibilityState={{ checked: selected }}
              onPress={() => selectAppearance(appearance)}
              style={{
                minHeight: 64,
                borderWidth: 1,
                borderRadius: 12,
                borderColor: selected ? theme.primary : theme.controlOutline,
                backgroundColor: selected ? theme.selected : theme.surface,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text>{selected ? "◉" : "○"}</Text>
              <NotebookText style={{ flex: 1 }}>{t(appearance)}</NotebookText>
              <View
                accessible={false}
                style={{
                  width: 46,
                  height: 32,
                  borderRadius: 6,
                  padding: 5,
                  backgroundColor: preview.canvas,
                  borderColor: preview.controlOutline,
                  borderWidth: 1,
                }}
              >
                <View
                  style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: preview.text }}
                />
              </View>
            </Pressable>
          );
        })}
        {error ? (
          <Text accessibilityRole="alert">
            {t("Could not save your settings. Please try again.")}
          </Text>
        ) : null}
        <ActionButton
          label={t("Backups")}
          variant="secondary"
          onPress={() => router.push("/backup")}
        />
      </ScrollView>
    </View>
  );
}
