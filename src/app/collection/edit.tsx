import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, Text, TextInput } from "../../ui/theme";
import { useServices } from "../../data/services";
import { EmojiControl } from "../../ui/emoji-control";
import { useUnsavedGuard } from "../../ui/use-unsaved-guard";
import { useKeyboardInset } from "../../ui/use-keyboard-inset";

export default function EditCollection() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const keyboardInset = useKeyboardInset();
  const { repository, refresh } = useServices();
  const existing = id
    ? repository.listCollections().find((item) => item.id === Number(id))
    : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const [label, setLabel] = useState(existing?.shortLabel ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "📚");
  const [error, setError] = useState("");
  const allowLeave = useUnsavedGuard(
    name !== (existing?.name ?? "") ||
      label !== (existing?.shortLabel ?? "") ||
      icon !== (existing?.icon ?? "📚"),
  );
  if (id && !existing) return <Text>{t("Collection not found.")}</Text>;
  const save = () => {
    if (!name.trim() || !icon.trim()) {
      setError(t("Enter a name and icon to save the collection."));
      return;
    }
    try {
      const row = repository.saveCollection({ id: existing?.id, name, shortLabel: label, icon });
      refresh();
      allowLeave();
      if (existing) router.back();
      else router.replace({ pathname: "/collection/[id]", params: { id: row.id } });
    } catch {
      setError(t("saveCollectionError"));
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
        <Text>{t("Collection name")}</Text>
        <TextInput
          accessibilityLabel={t("Collection name")}
          value={name}
          onChangeText={setName}
          style={{ borderWidth: 1, padding: 10 }}
        />
        <Text>{t("Short label (optional)")}</Text>
        <TextInput
          accessibilityLabel={t("Short label")}
          value={label}
          onChangeText={setLabel}
          style={{ borderWidth: 1, padding: 10 }}
        />
        <EmojiControl label={t("Choose icon")} value={icon} onChange={setIcon} />
        {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        <Button title={t("Save")} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
