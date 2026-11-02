import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "react-native";
import { useServices } from "../../data/services";
import { ScrollView, Text } from "../../ui/theme";

export function Intro() {
  const { repository, refresh } = useServices();
  const { t } = useTranslation();
  const router = useRouter();
  const step = Math.min(repository.getPreferences().onboardingStep, 3);
  const pages = [
    { title: t("introWelcome"), body: t("introCollections") },
    { title: t("introTermsTitle"), body: t("introTerms") },
    { title: t("introFiltersTitle"), body: t("introFilters") },
    { title: t("introBackupTitle"), body: t("introBackup") },
  ];
  const page = pages[step];
  const complete = () => {
    repository.updatePreferences({ onboardingComplete: true, onboardingStep: step });
    refresh();
  };
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 16, justifyContent: "center" }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>{page.title}</Text>
      <Text style={{ fontSize: 18 }}>{page.body}</Text>
      <Text>
        {step + 1} / {pages.length}
      </Text>
      {step > 0 && (
        <Button
          title={t("introBack")}
          onPress={() => {
            repository.updatePreferences({ onboardingStep: step - 1 });
            refresh();
          }}
        />
      )}
      {step < pages.length - 1 ? (
        <Button
          title={t("introNext")}
          onPress={() => {
            repository.updatePreferences({ onboardingStep: step + 1 });
            refresh();
          }}
        />
      ) : (
        <Button title={t("introStart")} onPress={complete} />
      )}
      <Button
        title={t("introCreate")}
        onPress={() => {
          complete();
          router.push("/collection/edit");
        }}
      />
      <Button title={t("introRestore")} onPress={() => router.push("/backup")} />
      <Button title={t("introSkip")} onPress={complete} />
    </ScrollView>
  );
}
