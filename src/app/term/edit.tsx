import { usePronunciation } from "../../features/vocabulary/use-pronunciation";
import { PronunciationControls } from "../../features/vocabulary/pronunciation-controls";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, TextInput as NativeTextInput } from "react-native";
import { Text, TextInput, View, useTheme } from "../../ui/theme";
import { NotebookText } from "../../ui/typography";
import { ActionButton } from "../../ui/action-button";
import { CategoryChip } from "../../ui/controls";
import { useServices } from "../../data/services";
import { useUnsavedGuard } from "../../ui/use-unsaved-guard";
import { AppBar, ScreenLayout } from "../../ui/layout";

export default function EditTerm() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; collectionId: string }>();
  const collectionId = Number(params.collectionId);
  const { repository, refresh, revision } = useServices();
  const router = useRouter();
  const theme = useTheme();
  const [focused, setFocused] = useState<"original" | "translation" | "notes">();
  const existing = params.id
    ? repository.listTerms(collectionId).find((term) => term.id === Number(params.id))
    : undefined;
  const audio = usePronunciation(
    existing ? repository.getTermAudio(collectionId, existing.id) : undefined,
  );
  const [original, setOriginal] = useState(existing?.original ?? "");
  const [translation, setTranslation] = useState(existing?.translation ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [categoryIds, setCategoryIds] = useState<number[]>(existing?.categoryIds ?? []);
  const originalRef = useRef<React.ElementRef<typeof NativeTextInput>>(null);
  const translationRef = useRef<React.ElementRef<typeof NativeTextInput>>(null);
  const saving = useRef(false);
  const categories = repository.listCategories(collectionId);
  useEffect(() => {
    const allowed = new Set(repository.listCategories(collectionId).map((category) => category.id));
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setCategoryIds((ids) => ids.filter((id) => allowed.has(id)));
    });
    return () => {
      active = false;
    };
  }, [repository, collectionId, revision]);
  const allowLeave = useUnsavedGuard(
    audio.changed ||
      original !== (existing?.original ?? "") ||
      translation !== (existing?.translation ?? "") ||
      notes !== (existing?.notes ?? "") ||
      JSON.stringify([...categoryIds].sort()) !==
        JSON.stringify([...(existing?.categoryIds ?? [])].sort()),
    () => originalRef.current?.focus(),
  );
  if (
    (params.id && !existing) ||
    !repository.listCollections().some((item) => item.id === collectionId)
  )
    return <Text>{t("Term or collection not found.")}</Text>;
  const invalidOriginal = submitted && !original.trim();
  const invalidTranslation = submitted && !translation.trim();
  const save = () => {
    if (saving.current || audio.recording || audio.busy) return;
    setSubmitted(true);
    if (!original.trim() || !translation.trim()) {
      const message = t(!original.trim() ? "Enter an expression." : "Add a translation.");
      AccessibilityInfo.announceForAccessibility(message);
      (!original.trim() ? originalRef : translationRef).current?.focus();
      return;
    }
    saving.current = true;
    try {
      repository.saveTerm({
        id: existing?.id,
        collectionId,
        original,
        translation,
        notes,
        audio: audio.changed ? audio.clip : undefined,
        categoryIds: categoryIds.filter((id) => categories.some((category) => category.id === id)),
      });
      refresh();
      allowLeave();
      router.back();
    } catch {
      saving.current = false;
      setError(t("saveTermError"));
    }
  };
  const inputStyle = {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.input,
    fontSize: 16,
  } as const;
  return (
    <ScreenLayout
      footer={
        <ActionButton label={t("Save")} disabled={audio.recording || audio.busy} onPress={save} />
      }
    >
      <AppBar
        title={t(existing ? "Edit term" : "Add term")}
        onBack={() => router.back()}
        backLabel={t("Close")}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>{t("Original expression")}</Text>
        <Text style={{ color: theme.secondaryText }}>{t("Required")}</Text>
      </View>
      <TextInput
        ref={originalRef}
        testID="term-original"
        accessibilityLabel={t("Original expression")}
        accessibilityHint={t("Required")}
        multiline
        onFocus={() => setFocused("original")}
        onBlur={() => setFocused(undefined)}
        value={original}
        onChangeText={setOriginal}
        style={[
          inputStyle,
          { textAlignVertical: "top" },
          focused === "original" && { borderWidth: 2, borderColor: theme.primary },
          invalidOriginal && { borderColor: theme.destructive },
        ]}
      />
      {invalidOriginal && (
        <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
          {t("Enter an expression.")}
        </Text>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>{t("Translation")}</Text>
        <Text style={{ color: theme.secondaryText }}>{t("Required")}</Text>
      </View>
      <TextInput
        ref={translationRef}
        testID="term-translation"
        accessibilityLabel={t("Translation")}
        accessibilityHint={t("Required")}
        multiline
        onFocus={() => setFocused("translation")}
        onBlur={() => setFocused(undefined)}
        value={translation}
        onChangeText={setTranslation}
        style={[
          inputStyle,
          { textAlignVertical: "top" },
          focused === "translation" && { borderWidth: 2, borderColor: theme.primary },
          invalidTranslation && { borderColor: theme.destructive },
        ]}
      />
      {invalidTranslation && (
        <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
          {t("Add a translation.")}
        </Text>
      )}
      <PronunciationControls audio={audio} editor />
      <Text>{t("Notes (optional)")}</Text>
      <TextInput
        testID="term-notes"
        accessibilityLabel={t("Notes")}
        onFocus={() => setFocused("notes")}
        onBlur={() => setFocused(undefined)}
        value={notes}
        onChangeText={setNotes}
        multiline
        style={[
          inputStyle,
          { minHeight: 96, textAlignVertical: "top" },
          focused === "notes" && { borderWidth: 2, borderColor: theme.primary },
        ]}
      />
      <NotebookText variant="section">{t("Categories")}</NotebookText>
      {(["grammatical", "thematic"] as const).map((kind) => (
        <View key={kind} style={{ gap: 8 }}>
          <NotebookText emphasis>
            {t(kind === "grammatical" ? "Grammatical" : "Thematic")}
          </NotebookText>
          {categories
            .filter((category) => category.kind === kind)
            .map((category) => {
              const selected = categoryIds.includes(category.id);
              return (
                <CategoryChip
                  key={category.id}
                  label={category.name}
                  kind={kind}
                  selected={selected}
                  onPress={() =>
                    setCategoryIds((current) =>
                      selected
                        ? current.filter((id) => id !== category.id)
                        : [...current, category.id],
                    )
                  }
                />
              );
            })}
        </View>
      ))}
      <ActionButton
        label={t("Manage categories")}
        variant="secondary"
        onPress={() =>
          router.push({ pathname: "/collection/categories", params: { collectionId } })
        }
      />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    </ScreenLayout>
  );
}
