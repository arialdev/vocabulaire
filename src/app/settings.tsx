import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { ScrollView, Text } from "../ui/theme";
import { useServices } from "../data/services";
import i18n, { resolveLanguage } from "../i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { repository, revision, refresh } = useServices();
  void revision;
  const prefs = repository.getPreferences();
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{t("settings")}</Text>
      <Text>{t("language")}</Text>
      {(["system", "en", "es"] as const).map((locale) => (
        <Button
          key={locale}
          title={`${prefs.locale === locale ? "✓ " : ""}${t(locale === "en" ? "english" : locale === "es" ? "spanish" : "system")}`}
          onPress={() => {
            repository.updatePreferences({ locale });
            void i18n.changeLanguage(resolveLanguage(locale));
            refresh();
          }}
        />
      ))}
      <Text>{t("appearance")}</Text>
      {(["system", "light", "dark"] as const).map((appearance) => (
        <Button
          key={appearance}
          title={`${prefs.appearance === appearance ? "✓ " : ""}${t(appearance)}`}
          onPress={() => {
            repository.updatePreferences({ appearance });
            refresh();
          }}
        />
      ))}
      <Button title={t("Backups")} onPress={() => router.push("/backup")} />
    </ScrollView>
  );
}
