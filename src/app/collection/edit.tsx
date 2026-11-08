import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { AccessibilityInfo, TextInput as NativeTextInput } from "react-native";
import { Text, TextInput, View } from "../../ui/theme";
import { useServices } from "../../data/services";
import { EmojiControl } from "../../ui/emoji-control";
import { useUnsavedGuard } from "../../ui/use-unsaved-guard";
import { AppBar, ScreenLayout } from "../../ui/layout";
import { ActionButton } from "../../ui/action-button";
import { NotebookText } from "../../ui/typography";
import { useTheme } from "../../ui/theme";

export default function EditCollection() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { repository, refresh } = useServices();
  const existing = id
    ? repository.listCollections().find((item) => item.id === Number(id))
    : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const saving = useRef(false);
  const nameRef = useRef<React.ElementRef<typeof NativeTextInput>>(null);
  const [icon, setIcon] = useState(existing?.icon ?? "📚");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const allowLeave = useUnsavedGuard(
    name !== (existing?.name ?? "") || icon !== (existing?.icon ?? "📚"),
    () => nameRef.current?.focus(),
  );
  if (id && !existing) return <Text>{t("Collection not found.")}</Text>;
  const save = () => {
    if (saving.current) return;
    if (!name.trim() || !icon.trim()) {
      const message = t("Give your collection a name.");
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
      nameRef.current?.focus();
      return;
    }
    saving.current = true;
    try {
      repository.saveCollection({
        id: existing?.id,
        name,
        shortLabel: existing?.shortLabel ?? null,
        icon,
      });
      refresh();
      allowLeave();
      router.back();
    } catch {
      saving.current = false;
      setError(t("saveCollectionError"));
    }
  };
  return (
    <ScreenLayout footer={<ActionButton label={t("Save")} onPress={save} />}>
      <AppBar
        title={t(existing ? "Edit collection" : "New collection")}
        onBack={() => router.back()}
        backLabel={t("Close")}
      />
      <NotebookText variant="pageTitle" emphasis>
        {t(existing ? "collectionEditHeading" : "collectionNewHeading")}
      </NotebookText>
      <NotebookText style={{ color: theme.secondaryText }}>
        {t("collectionEditorHelp")}
      </NotebookText>
      <EmojiControl label={t("Choose icon")} value={icon} onChange={setIcon} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>{t("Collection name")}</Text>
        <Text style={{ color: theme.secondaryText }}>{t("Required")}</Text>
      </View>
      <TextInput
        ref={nameRef}
        accessibilityLabel={t("Collection name")}
        accessibilityHint={t("Required")}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (error) setError("");
        }}
        style={{
          borderWidth: focused ? 2 : 1,
          borderRadius: 12,
          minHeight: 56,
          paddingHorizontal: 16,
          backgroundColor: theme.input,
          fontSize: 16,
          borderColor: error ? theme.destructive : focused ? theme.primary : theme.controlOutline,
        }}
      />
      {error ? (
        <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
          {error}
        </Text>
      ) : null}
    </ScreenLayout>
  );
}
