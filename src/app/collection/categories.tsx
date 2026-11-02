import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Button, FlatList } from "react-native";
import { Text, TextInput, View } from "../../ui/theme";
import { useServices } from "../../data/services";
import type { Category } from "../../data/schema";

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const { collectionId: param } = useLocalSearchParams<{ collectionId: string }>();
  const collectionId = Number(param);
  const { repository, revision, refresh } = useServices();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Category["kind"]>("grammatical");
  const [editing, setEditing] = useState<number>();
  const [error, setError] = useState("");
  void revision;
  if (!repository.listCollections().some((item) => item.id === collectionId))
    return <Text>{t("Collection not found.")}</Text>;
  const rows = repository.listCategories(collectionId);
  const save = () => {
    if (!name.trim()) {
      setError(t("Enter a category name."));
      return;
    }
    try {
      repository.saveCategory({ id: editing, collectionId, kind, name });
      setName("");
      setEditing(undefined);
      setError("");
      refresh();
    } catch {
      setError(t("saveCategoryError"));
    }
  };
  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{t("Categories")}</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>{t("No categories yet.")}</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1 }}>
              {item.name} ({t(item.kind === "grammatical" ? "Grammatical" : "Thematic")})
            </Text>
            <Button
              title={t("Edit")}
              onPress={() => {
                setEditing(item.id);
                setKind(item.kind);
                setName(item.name);
              }}
            />
            <Button
              title={t("Delete")}
              onPress={() =>
                Alert.alert(
                  t("Delete category?"),
                  t("confirmDeleteCategory", { name: item.name }),
                  [
                    { text: t("Cancel"), style: "cancel" },
                    {
                      text: t("Delete"),
                      style: "destructive",
                      onPress: () => {
                        try {
                          repository.deleteCategory(collectionId, item.id);
                          refresh();
                        } catch {
                          setError(t("deleteCategoryError"));
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
      <Text>{kind === "grammatical" ? t("Grammatical") : t("Thematic")}</Text>
      {!editing && (
        <Button
          title={t("Change category type")}
          onPress={() => setKind(kind === "grammatical" ? "thematic" : "grammatical")}
        />
      )}
      <TextInput
        accessibilityLabel={t("Category name")}
        placeholder={t("Category name")}
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10 }}
      />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Button title={editing ? t("Save category") : t("Add category")} onPress={save} />
      {editing && (
        <Button
          title={t("Cancel edit")}
          onPress={() => {
            setEditing(undefined);
            setName("");
          }}
        />
      )}
    </View>
  );
}
