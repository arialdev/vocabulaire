import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, Text, TextInput } from "../../ui/theme";
import { useServices } from "../../data/services";
import { useUnsavedGuard } from "../../ui/use-unsaved-guard";
import { useKeyboardInset } from "../../ui/use-keyboard-inset";

export default function EditTerm() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; collectionId: string }>();
  const collectionId = Number(params.collectionId);
  const { repository, refresh } = useServices();
  const router = useRouter();
  const keyboardInset = useKeyboardInset();
  const existing = params.id
    ? repository.listTerms(collectionId).find((term) => term.id === Number(params.id))
    : undefined;
  const [original, setOriginal] = useState(existing?.original ?? "");
  const [translation, setTranslation] = useState(existing?.translation ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [error, setError] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>(existing?.categoryIds ?? []);
  const allowLeave = useUnsavedGuard(
    original !== (existing?.original ?? "") ||
      translation !== (existing?.translation ?? "") ||
      notes !== (existing?.notes ?? "") ||
      JSON.stringify([...categoryIds].sort()) !==
        JSON.stringify([...(existing?.categoryIds ?? [])].sort()),
  );
  if (
    (params.id && !existing) ||
    !repository.listCollections().some((item) => item.id === collectionId)
  )
    return <Text>{t("Term or collection not found.")}</Text>;
  const save = () => {
    if (!original.trim() || !translation.trim()) {
      setError(t("Enter an original expression and translation to save the term."));
      return;
    }
    try {
      repository.saveTerm({
        id: existing?.id,
        collectionId,
        original,
        translation,
        notes,
        categoryIds,
      });
      refresh();
      allowLeave();
      router.back();
    } catch {
      setError(t("saveTermError"));
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 20 + keyboardInset, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text>{t("Original expression")}</Text>
        <TextInput
          accessibilityLabel={t("Original expression")}
          value={original}
          onChangeText={setOriginal}
          style={{ borderWidth: 1, padding: 10 }}
        />
        <Text>{t("Translation")}</Text>
        <TextInput
          accessibilityLabel={t("Translation")}
          value={translation}
          onChangeText={setTranslation}
          style={{ borderWidth: 1, padding: 10 }}
        />
        <Text>{t("Notes (optional)")}</Text>
        <TextInput
          accessibilityLabel={t("Notes")}
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ borderWidth: 1, padding: 10, minHeight: 80 }}
        />
        <Text>{t("Categories")}</Text>
        {repository.listCategories(collectionId).map((category) => (
          <Button
            key={category.id}
            title={`${categoryIds.includes(category.id) ? "✓ " : ""}${category.name} (${t(category.kind === "grammatical" ? "Grammatical" : "Thematic")})`}
            onPress={() =>
              setCategoryIds((current) =>
                current.includes(category.id)
                  ? current.filter((id) => id !== category.id)
                  : [...current, category.id],
              )
            }
          />
        ))}
        {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        <Button title={t("Save")} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
