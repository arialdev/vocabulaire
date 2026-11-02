import { useModalFocus } from "../../ui/use-modal-focus";
import { useReducedMotion } from "../../ui/use-reduced-motion";
import { useKeyboardInset } from "../../ui/use-keyboard-inset";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  StyleSheet,
  TextInput as NativeTextInput,
  View as NativeView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, TextInput, View, useTheme } from "../../ui/theme";
import { Icon, NotebookText } from "../../ui/typography";
import { ActionButton } from "../../ui/action-button";
import { IconButton } from "../../ui/controls";
import { AppBar } from "../../ui/layout";
import { useServices } from "../../data/services";
import type { Category } from "../../data/schema";

type Overlay = { type: "edit"; item?: Category } | { type: "delete"; item: Category } | undefined;
export default function CategoriesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { collectionId: param } = useLocalSearchParams<{ collectionId: string }>();
  const collectionId = Number(param);
  const { repository, revision, refresh } = useServices();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardInset();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Category["kind"]>("grammatical");
  const [overlay, setOverlay] = useState<Overlay>();
  const [error, setError] = useState("");
  const nameRef = useRef<React.ElementRef<typeof NativeTextInput>>(null);
  const saving = useRef(false);
  const addOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const sheetHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  const actionOpener = useRef<React.ElementRef<typeof NativeView> | null>(null);
  const actionNodes = useRef(new Map<string, React.ElementRef<typeof NativeView>>());
  useModalFocus(!!overlay, sheetHeading, actionOpener);
  void revision;
  if (!repository.listCollections().some((item) => item.id === collectionId))
    return <Text>{t("Collection not found.")}</Text>;
  const rows = repository.listCategories(collectionId);
  const close = () => {
    setOverlay(undefined);
    setError("");
  };
  const edit = (item?: Category) => {
    setName(item?.name ?? "");
    setKind(item?.kind ?? "grammatical");
    setError("");
    setOverlay({ type: "edit", item });
  };
  const save = () => {
    if (saving.current) return;
    if (!name.trim()) {
      const message = t("Enter a category name.");
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
      nameRef.current?.focus();
      return;
    }
    saving.current = true;
    try {
      repository.saveCategory({
        id: overlay?.type === "edit" ? overlay.item?.id : undefined,
        collectionId,
        kind,
        name,
      });
      close();
      refresh();
    } catch {
      setError(t("saveCategoryError"));
    } finally {
      saving.current = false;
    }
  };
  const remove = () => {
    if (saving.current || overlay?.type !== "delete") return;
    saving.current = true;
    try {
      repository.deleteCategory(collectionId, overlay.item.id);
      actionOpener.current = addOpener.current;
      close();
      refresh();
    } catch {
      setError(t("deleteCategoryError"));
    } finally {
      saving.current = false;
    }
  };
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 12 }}>
        <AppBar title={t("Categories")} onBack={() => router.back()} backLabel={t("Back")} />
      </View>
      <ScrollView
        style={{ backgroundColor: theme.surface }}
        contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1 }}
      >
        {!rows.length && (
          <View
            style={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              backgroundColor: theme.surface,
            }}
          >
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              style={{
                width: 72,
                height: 72,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: theme.divider,
                borderRadius: 20,
                backgroundColor: theme.input,
              }}
            >
              <Icon name="categories" size={36} color={theme.primary} />
            </View>
            <NotebookText variant="headword" emphasis style={{ textAlign: "center" }}>
              {t("emptyCategoriesTitle")}
            </NotebookText>
            <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
              {t("emptyCategoriesHelp")}
            </NotebookText>
            <NotebookText
              variant="secondary"
              style={{ textAlign: "center", color: theme.secondaryText }}
            >
              {t("No categories yet.")}
            </NotebookText>
          </View>
        )}
        {!!rows.length && (
          <View
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: theme.divider,
              borderRadius: 16,
              backgroundColor: theme.canvas,
            }}
          >
            <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
              {t("Categories belong to this collection. Deleting one keeps its terms.")}
            </NotebookText>
          </View>
        )}
        {(["grammatical", "thematic"] as const).map((group) => {
          const items = rows.filter((item) => item.kind === group);
          if (!items.length) return null;
          return (
            <View key={group} style={{ gap: 8, backgroundColor: theme.surface }}>
              <NotebookText variant="headword" emphasis>
                {t(group === "grammatical" ? "Grammatical" : "Thematic")}
              </NotebookText>
              {items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: theme.divider,
                    borderRadius: 12,
                    minHeight: 64,
                    paddingLeft: 12,
                    backgroundColor: theme.surface,
                  }}
                >
                  <NotebookText
                    style={{
                      flex: 1,
                      color: group === "grammatical" ? theme.grammaticalText : theme.thematicText,
                    }}
                  >
                    {group === "grammatical" ? "Aa" : "♧"} {item.name}
                  </NotebookText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("editCategory", { name: item.name })}
                    ref={(node) => {
                      const key = `edit-${item.id}`;
                      if (node) actionNodes.current.set(key, node);
                      else actionNodes.current.delete(key);
                    }}
                    onPress={() => {
                      actionOpener.current = actionNodes.current.get(`edit-${item.id}`) ?? null;
                      edit(item);
                    }}
                    style={{ padding: 12 }}
                  >
                    <Text>{t("Edit")}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("deleteCategory", { name: item.name })}
                    ref={(node) => {
                      const key = `delete-${item.id}`;
                      if (node) actionNodes.current.set(key, node);
                      else actionNodes.current.delete(key);
                    }}
                    onPress={() => {
                      actionOpener.current = actionNodes.current.get(`delete-${item.id}`) ?? null;
                      setError("");
                      setOverlay({ type: "delete", item });
                    }}
                    style={{ padding: 12 }}
                  >
                    <Text>{t("Delete")}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })}
        <ActionButton
          ref={addOpener}
          label={t("Add category")}
          onPress={() => {
            actionOpener.current = addOpener.current;
            edit();
          }}
        />
      </ScrollView>
      <Modal
        visible={!!overlay}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.48)",
            justifyContent: overlay?.type === "delete" ? "center" : "flex-end",
            paddingHorizontal: overlay?.type === "delete" ? 24 : 0,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Cancel")}
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: "90%",
              padding: 24,
              paddingBottom: overlay?.type === "delete" ? 24 : Math.max(insets.bottom, 24),
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderBottomLeftRadius: overlay?.type === "delete" ? 24 : 0,
              borderBottomRightRadius: overlay?.type === "delete" ? 24 : 0,
              backgroundColor: theme.surface,
            }}
          >
            <ScrollView
              style={{ backgroundColor: theme.surface }}
              contentContainerStyle={{ gap: 12, paddingBottom: keyboardInset }}
              keyboardShouldPersistTaps="handled"
            >
              {overlay?.type !== "delete" && (
                <View
                  accessible={false}
                  style={{
                    alignSelf: "center",
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.divider,
                  }}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.surface,
                }}
              >
                <Pressable
                  ref={sheetHeading}
                  accessible
                  accessibilityRole="header"
                  style={{ flex: 1 }}
                >
                  <NotebookText variant="headword" emphasis>
                    {t(
                      overlay?.type === "delete"
                        ? "Delete category?"
                        : overlay?.type === "edit" && overlay.item
                          ? "Edit category"
                          : "Add category",
                    )}
                  </NotebookText>
                </Pressable>
                {overlay?.type !== "delete" && (
                  <IconButton name="close" label={t("Close")} onPress={close} />
                )}
              </View>
              {overlay?.type === "delete" ? (
                <>
                  <NotebookText>
                    {t("confirmDeleteCategory", { name: overlay.item.name })}
                  </NotebookText>
                  <ActionButton label={t("Cancel")} variant="secondary" onPress={close} />
                  <ActionButton label={t("Delete")} variant="destructive" onPress={remove} />
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: theme.surface,
                    }}
                  >
                    <Text>{t("Category name")}</Text>
                    <Text style={{ color: theme.secondaryText }}>{t("Required")}</Text>
                  </View>
                  <TextInput
                    ref={nameRef}
                    accessibilityLabel={t("Category name")}
                    accessibilityHint={t("Required")}
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      setError("");
                    }}
                    style={{
                      minHeight: 56,
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      backgroundColor: theme.input,
                      borderColor: error ? theme.destructive : theme.controlOutline,
                    }}
                  />
                  {error ? (
                    <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
                      {error}
                    </Text>
                  ) : null}
                  <Text>{t("Category type")}</Text>
                  {(["grammatical", "thematic"] as const).map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityLabel={t(option === "grammatical" ? "Grammatical" : "Thematic")}
                      accessibilityState={{
                        checked: kind === option,
                        disabled: !!(overlay?.type === "edit" && overlay.item),
                      }}
                      disabled={!!(overlay?.type === "edit" && overlay.item)}
                      onPress={() => setKind(option)}
                      style={{
                        minHeight: 64,
                        justifyContent: "center",
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: kind === option ? 2 : 1,
                        borderColor: kind === option ? theme.primary : theme.divider,
                        backgroundColor: kind === option ? theme.selected : theme.surface,
                      }}
                    >
                      <NotebookText emphasis>
                        {kind === option ? "◉ " : "○ "}
                        {t(option === "grammatical" ? "Grammatical" : "Thematic")}
                      </NotebookText>
                      <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
                        {t(
                          option === "grammatical"
                            ? "How a word works, such as noun or verb."
                            : "What a word is about, such as travel or food.",
                        )}
                      </NotebookText>
                    </Pressable>
                  ))}
                  <ActionButton label={t("Save category")} onPress={save} />
                </>
              )}
              {overlay?.type === "delete" && error ? (
                <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
                  {error}
                </Text>
              ) : null}
              {overlay?.type !== "delete" && (
                <ActionButton label={t("Cancel")} variant="secondary" onPress={close} />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
