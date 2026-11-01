import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Button } from "react-native";
import { useState } from "react";
import { useServices } from "../../data/services";
import { ScrollView, Text } from "../../ui/theme";

export default function TermDetails() {
  const { id, collectionId: collection } = useLocalSearchParams<{
    id: string;
    collectionId: string;
  }>();
  const collectionId = Number(collection);
  const { repository, revision, refresh } = useServices();
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");
  void revision;
  const term = repository.listTerms(collectionId).find((item) => item.id === Number(id));
  if (!term) return <Text>{t("Term or collection not found.")}</Text>;
  const categories = repository
    .listCategories(collectionId)
    .filter((item) => term.categoryIds.includes(item.id));
  const remove = () =>
    Alert.alert(t("Delete term?"), t("confirmDeleteTerm", { name: term.original }), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Delete"),
        style: "destructive",
        onPress: () => {
          try {
            repository.deleteTerm(collectionId, term.id);
            refresh();
            router.back();
          } catch {
            setError(t("Could not delete term."));
          }
        },
      },
    ]);
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>{term.original}</Text>
      <Text style={{ fontSize: 20 }}>{term.translation}</Text>
      {term.notes ? <Text>{term.notes}</Text> : null}
      <Text>
        {t("Categories")}: {categories.map((item) => item.name).join(", ")}
      </Text>
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Button
        title={t("Edit")}
        onPress={() =>
          router.push({ pathname: "/term/edit", params: { collectionId, id: term.id } })
        }
      />
      <Button title={t("Delete")} onPress={remove} />
    </ScrollView>
  );
}
