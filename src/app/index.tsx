import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, FlatList, Pressable, StyleSheet } from "react-native";
import { Text, View } from "../ui/theme";
import { useServices } from "../data/services";
import { Intro } from "../features/onboarding/intro";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { repository, refresh, revision } = useServices();
  const router = useRouter();
  const [error, setError] = useState("");
  void revision;
  if (!repository.getPreferences().onboardingComplete) return <Intro />;
  const selectedId = repository.getPreferences().selectedCollectionId;
  let collections: ReturnType<typeof repository.listCollections> = [];
  let loadError = "";
  try {
    collections = repository.listCollections();
  } catch {
    loadError = t("Could not load collections.");
  }
  const open = (id: number) => {
    try {
      repository.updatePreferences({ selectedCollectionId: id });
      refresh();
      router.push({ pathname: "/collection/[id]", params: { id } });
    } catch {
      setError(t("Could not select this collection."));
    }
  };
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t("Collections")}</Text>
      {error || loadError ? <Text accessibilityRole="alert">{error || loadError}</Text> : null}
      <FlatList
        data={collections}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>{t("Create a collection to start adding vocabulary.")}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              onPress={() => open(item.id)}
              accessibilityRole="button"
              accessibilityLabel={t("openCollection", { name: item.name })}
              style={styles.grow}
            >
              <Text style={styles.label}>
                {item.id === selectedId ? "✓ " : ""}
                {item.icon} {item.name}
                {item.shortLabel ? ` (${item.shortLabel})` : ""}
              </Text>
            </Pressable>
            <Button
              title={t("Edit")}
              onPress={() => router.push({ pathname: "/collection/edit", params: { id: item.id } })}
            />
            <Button
              title={t("Delete")}
              onPress={() =>
                Alert.alert(
                  t("Delete collection?"),
                  t("confirmDeleteCollection", { name: item.name }),
                  [
                    { text: t("Cancel"), style: "cancel" },
                    {
                      text: t("Delete"),
                      style: "destructive",
                      onPress: () => {
                        try {
                          repository.deleteCollection(item.id);
                          refresh();
                        } catch {
                          setError(t("Could not delete this collection."));
                        }
                      },
                    },
                  ],
                )
              }
            />
          </View>
        )}
      />
      <Button title={t("Settings")} onPress={() => router.push("/settings")} />
      <Button title={t("Add collection")} onPress={() => router.push("/collection/edit")} />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  grow: { flex: 1 },
  label: { fontSize: 18 },
});
