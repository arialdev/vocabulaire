import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button } from "react-native";
import { ScrollView, Text } from "../ui/theme";
import { useServices } from "../data/services";
import i18n, { resolveLanguage } from "../i18n";
import { replaceFromBackup, type Backup } from "../platform/backup";
import { pickBackup, shareBackup } from "../platform/backup-files";

export default function BackupScreen() {
  const { t } = useTranslation();
  const { db, repository, refresh } = useServices();
  const router = useRouter();
  const [preview, setPreview] = useState<Backup>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof Error
          ? t(e.message, { defaultValue: t("File operation failed.") })
          : t("File operation failed."),
      );
    } finally {
      setBusy(false);
    }
  };
  const restore = () => {
    if (!preview) return;
    Alert.alert(t("Replace all current data?"), t("restoreWarning"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Replace"),
        style: "destructive",
        onPress: () => {
          try {
            replaceFromBackup(db, preview);
          } catch {
            setError(t("Restore failed. Your previous data was kept."));
            return;
          }
          try {
            void i18n.changeLanguage(resolveLanguage(repository.getPreferences().locale));
            refresh();
            router.dismissAll();
            router.replace("/");
          } catch {
            setError(t("Data was restored, but the screen could not refresh. Restart the app."));
          }
        },
      },
    ]);
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{t("Backups")}</Text>
      <Text>{t("Backups from the old Ionic app cannot be imported.")}</Text>
      <Button
        disabled={busy}
        title={t("Export current data")}
        onPress={() => void run(() => shareBackup(db))}
      />
      <Button
        disabled={busy}
        title={t("Choose backup to restore")}
        onPress={() =>
          void run(async () => {
            const result = await pickBackup();
            if (result) setPreview(result);
          })
        }
      />
      {preview && (
        <>
          <Text>
            {t("restorePreview", {
              collections: preview.data.collections.length,
              terms: preview.data.terms.length,
              categories: preview.data.categories.length,
              filters: preview.data.savedFilters.length,
            })}
          </Text>
          <Text>{t("restoreHint")}</Text>
          <Button disabled={busy} title={t("Continue to confirmation")} onPress={restore} />
          <Button title={t("Cancel restore")} onPress={() => setPreview(undefined)} />
        </>
      )}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    </ScrollView>
  );
}
