import { useModalFocus } from "../../ui/use-modal-focus";
import { useReducedMotion } from "../../ui/use-reduced-motion";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  TextInput as NativeTextInput,
  useWindowDimensions,
  View as NativeView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "../../ui/action-button";
import { CategoryChip, IconButton } from "../../ui/controls";
import { Icon, NotebookText } from "../../ui/typography";
import { ScrollView, Text, TextInput, View, useTheme } from "../../ui/theme";
import { queryTerms, type TermQuery, type TermWithCategories } from "../../domain/term-query";
import type { Category } from "../../data/schema";
import type { Repository } from "../../data/repository";
import EmojiPicker from "../../../modules/emoji-picker";

type Display = {
  detailed: boolean;
  field: TermQuery["sortField"];
  direction: TermQuery["direction"];
};
type Saved = ReturnType<Repository["listFilters"]>[number];
type Props = {
  collectionId: number;
  search: string;
  categories: Category[];
  terms: TermWithCategories[];
  selected: number[];
  display: Display;
  saved: Saved[];
  activeId?: number;
  repository: Repository;
  refresh: () => void;
  onClose: () => void;
  onApply: (ids: number[], display: Display) => boolean;
  onApplySaved: (filter: Saved) => void;
  onDeleteSaved: (id: number) => void;
};
export function FilterSheet({
  collectionId,
  search,
  categories,
  terms,
  selected,
  display,
  saved,
  activeId,
  repository,
  refresh,
  onClose,
  onApply,
  onApplySaved,
  onDeleteSaved,
}: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const fullHeight = width <= 320 || fontScale >= 2;
  const [tab, setTab] = useState<"categories" | "display" | "saved">("categories");
  const [draftIds, setDraftIds] = useState(selected);
  const [draftDisplay, setDraftDisplay] = useState(display);
  const [child, setChild] = useState<"save" | "emoji" | "delete">();
  const [target, setTarget] = useState<Saved>();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [pendingIcon, setPendingIcon] = useState(icon);
  const [error, setError] = useState("");
  const nameRef = useRef<React.ElementRef<typeof NativeTextInput>>(null);
  const saving = useRef(false);
  const headingRef = useRef<React.ElementRef<typeof NativeView>>(null);
  const childHeadingRef = useRef<React.ElementRef<typeof NativeView>>(null);
  useModalFocus(true, headingRef);
  useModalFocus(!!child, childHeadingRef, headingRef, child);
  const validIds = draftIds.filter((id) => categories.some((category) => category.id === id));
  const preview = queryTerms(terms, categories, {
    search,
    grammaticalIds: categories
      .filter((c) => c.kind === "grammatical" && validIds.includes(c.id))
      .map((c) => c.id),
    thematicIds: categories
      .filter((c) => c.kind === "thematic" && validIds.includes(c.id))
      .map((c) => c.id),
    sortField: draftDisplay.field,
    direction: draftDisplay.direction,
  });
  const closeChild = () => {
    setChild(undefined);
    setError("");
  };
  const dismiss = () => {
    if (child === "emoji") {
      setChild("save");
      return;
    }
    if (child) {
      closeChild();
      return;
    }
    onClose();
  };
  const save = () => {
    if (saving.current) return;
    if (!name.trim()) {
      const message = t("Enter a filter name.");
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
      nameRef.current?.focus();
      return;
    }
    saving.current = true;
    try {
      repository.saveFilter({ collectionId, name, icon, search, categoryIds: validIds });
      setName("");
      closeChild();
      refresh();
    } catch {
      setError(t("saveFilterError"));
    } finally {
      saving.current = false;
    }
  };
  const remove = () => {
    if (!target) return;
    try {
      repository.deleteFilter(collectionId, target.id);
      onDeleteSaved(target.id);
      setTarget(undefined);
      closeChild();
      refresh();
    } catch {
      setError(t("Could not delete saved filter."));
    }
  };
  return (
    <Modal
      visible
      transparent
      animationType={reducedMotion ? "none" : "slide"}
      onRequestClose={dismiss}
    >
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.48)" }}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={dismiss}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        />
        <View
          accessibilityViewIsModal
          style={{
            height: child === "delete" || fullHeight ? "100%" : "90%",
            backgroundColor: child === "delete" ? "transparent" : theme.surface,
            paddingTop: child === "delete" ? 0 : fullHeight ? Math.max(insets.top, 16) : 0,
            paddingBottom: child === "delete" ? 0 : Math.max(insets.bottom, 16),
            borderTopLeftRadius: child === "delete" || fullHeight ? 0 : 24,
            borderTopRightRadius: child === "delete" || fullHeight ? 0 : 24,
            overflow: "hidden",
          }}
        >
          <ScrollView
            style={{ backgroundColor: child === "delete" ? "transparent" : theme.surface }}
            contentContainerStyle={{
              padding: 24,
              gap: 12,
              flexGrow: 1,
              justifyContent: child === "delete" ? "center" : "flex-start",
            }}
            keyboardShouldPersistTaps="handled"
          >
            {child !== "delete" && !fullHeight && (
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
            {child === "emoji" ? (
              <>
                <Pressable ref={childHeadingRef} accessible accessibilityRole="header">
                  <NotebookText variant="section" emphasis>
                    {t("Choose filter icon")}
                  </NotebookText>
                </Pressable>
                <EmojiPicker
                  key={`${theme.mode}-${i18n.resolvedLanguage}`}
                  language={i18n.resolvedLanguage ?? "en"}
                  appearance={theme.mode}
                  style={{ minHeight: 360 }}
                  onEmojiPicked={(event) => setPendingIcon(event.nativeEvent.emoji)}
                />
                <NotebookText>{pendingIcon}</NotebookText>
                <ActionButton
                  label={t("Apply emoji")}
                  onPress={() => {
                    setIcon(pendingIcon);
                    setChild("save");
                  }}
                />
                <ActionButton
                  label={t("Cancel")}
                  variant="secondary"
                  onPress={() => setChild("save")}
                />
              </>
            ) : child === "save" ? (
              <>
                <Pressable ref={childHeadingRef} accessible accessibilityRole="header">
                  <NotebookText variant="section" emphasis>
                    {t("Save filter")}
                  </NotebookText>
                </Pressable>
                <NotebookText>
                  {t("Search")}: {search || "—"}
                </NotebookText>
                <NotebookText>
                  {t("Categories")}:{" "}
                  {categories
                    .filter((c) => validIds.includes(c.id))
                    .map((c) => c.name)
                    .join(", ") || "—"}
                </NotebookText>
                <Text>{t("Saved filter name")}</Text>
                <TextInput
                  ref={nameRef}
                  accessibilityLabel={t("Saved filter name")}
                  accessibilityHint={t("Required")}
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setError("");
                  }}
                  style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    minHeight: 56,
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
                <ActionButton
                  label={`${t("Choose filter icon")}: ${icon}`}
                  variant="secondary"
                  onPress={() => {
                    setPendingIcon(icon);
                    setChild("emoji");
                  }}
                />
                <ActionButton testID="save-filter" label={t("Save filter")} onPress={save} />
                <ActionButton label={t("Cancel")} variant="secondary" onPress={closeChild} />
              </>
            ) : child === "delete" ? (
              <View
                accessibilityViewIsModal
                style={{ padding: 24, borderRadius: 24, gap: 16, backgroundColor: theme.surface }}
              >
                <Pressable ref={childHeadingRef} accessible accessibilityRole="header">
                  <NotebookText variant="headword" emphasis>
                    {t("Delete saved filter?")}
                  </NotebookText>
                </Pressable>
                <NotebookText>{target?.name}</NotebookText>
                <NotebookText>
                  {t("Deleting this filter keeps your terms and categories.")}
                </NotebookText>
                <ActionButton label={t("Cancel")} variant="secondary" onPress={closeChild} />
                <ActionButton label={t("Delete")} variant="destructive" onPress={remove} />
                {error ? (
                  <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
                    {error}
                  </Text>
                ) : null}
              </View>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.surface,
                  }}
                >
                  <Pressable
                    ref={headingRef}
                    accessible
                    accessibilityRole="header"
                    style={{ flex: 1 }}
                  >
                    <NotebookText variant="pageTitle" emphasis>
                      {t("Filters and display")}
                    </NotebookText>
                  </Pressable>
                  <IconButton name="close" label={t("Close")} onPress={onClose} />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    backgroundColor: theme.surface,
                  }}
                >
                  {(["categories", "display", "saved"] as const).map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: tab === option }}
                      onPress={() => setTab(option)}
                      style={{
                        padding: 12,
                        minHeight: 48,
                        borderBottomWidth: tab === option ? 2 : 0,
                        borderColor: theme.primary,
                      }}
                    >
                      <NotebookText>
                        {t(
                          option === "categories"
                            ? "Categories"
                            : option === "display"
                              ? "Display"
                              : "Saved filters",
                        )}
                      </NotebookText>
                    </Pressable>
                  ))}
                </View>
                {tab === "categories" ? (
                  <>
                    <NotebookText>{t("filterMatchingHelp")}</NotebookText>
                    {(["grammatical", "thematic"] as const).map((kind) => (
                      <View key={kind} style={{ gap: 8, backgroundColor: theme.surface }}>
                        <NotebookText emphasis>
                          {t(kind === "grammatical" ? "Grammatical" : "Thematic")}
                        </NotebookText>
                        {categories
                          .filter((c) => c.kind === kind)
                          .map((c) => (
                            <CategoryChip
                              key={c.id}
                              label={c.name}
                              kind={c.kind}
                              selected={validIds.includes(c.id)}
                              onPress={() =>
                                setDraftIds((ids) =>
                                  ids.includes(c.id)
                                    ? ids.filter((id) => id !== c.id)
                                    : [...ids, c.id],
                                )
                              }
                            />
                          ))}
                      </View>
                    ))}
                    <ActionButton
                      label={t("Clear category filters")}
                      variant="secondary"
                      onPress={() => setDraftIds([])}
                    />
                    <ActionButton
                      label={t("Save current selection")}
                      variant="secondary"
                      onPress={() => {
                        setError("");
                        setChild("save");
                      }}
                    />
                  </>
                ) : tab === "display" ? (
                  <>
                    <NotebookText emphasis>{t("Sort by")}</NotebookText>
                    {(["original", "translation", "updated"] as const).map((field) => (
                      <Pressable
                        key={field}
                        accessibilityRole="radio"
                        accessibilityLabel={t(
                          field === "original"
                            ? "sortOriginal"
                            : field === "translation"
                              ? "sortTranslation"
                              : "sortUpdated",
                        )}
                        accessibilityState={{ checked: draftDisplay.field === field }}
                        onPress={() => setDraftDisplay((current) => ({ ...current, field }))}
                        style={{ minHeight: 48, justifyContent: "center" }}
                      >
                        <NotebookText>
                          {draftDisplay.field === field ? "◉ " : "○ "}
                          {t(
                            field === "original"
                              ? "sortOriginal"
                              : field === "translation"
                                ? "sortTranslation"
                                : "sortUpdated",
                          )}
                        </NotebookText>
                      </Pressable>
                    ))}
                    {(["asc", "desc"] as const).map((direction) => (
                      <Pressable
                        key={direction}
                        accessibilityRole="radio"
                        accessibilityLabel={t(
                          draftDisplay.field === "updated"
                            ? direction === "asc"
                              ? "Oldest first"
                              : "Newest first"
                            : direction === "asc"
                              ? "A–Z"
                              : "Z–A",
                        )}
                        accessibilityState={{ checked: draftDisplay.direction === direction }}
                        onPress={() => setDraftDisplay((current) => ({ ...current, direction }))}
                        style={{ minHeight: 48, justifyContent: "center" }}
                      >
                        <NotebookText>
                          {draftDisplay.direction === direction ? "◉ " : "○ "}
                          {t(
                            draftDisplay.field === "updated"
                              ? direction === "asc"
                                ? "Oldest first"
                                : "Newest first"
                              : direction === "asc"
                                ? "A–Z"
                                : "Z–A",
                          )}
                        </NotebookText>
                      </Pressable>
                    ))}
                    {([false, true] as const).map((detailed) => (
                      <Pressable
                        key={String(detailed)}
                        accessibilityRole="radio"
                        accessibilityLabel={t(detailed ? "Detailed view" : "Compact view")}
                        accessibilityState={{ checked: draftDisplay.detailed === detailed }}
                        onPress={() => setDraftDisplay((current) => ({ ...current, detailed }))}
                        style={{ minHeight: 48, justifyContent: "center" }}
                      >
                        <NotebookText>
                          {draftDisplay.detailed === detailed ? "◉ " : "○ "}
                          {t(detailed ? "Detailed view" : "Compact view")}
                        </NotebookText>
                      </Pressable>
                    ))}
                  </>
                ) : (
                  <>
                    {!saved.length && (
                      <View
                        style={{
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 24,
                          backgroundColor: theme.surface,
                        }}
                      >
                        <Icon name="categories" size={40} color={theme.primary} />
                        <NotebookText variant="headword" emphasis style={{ textAlign: "center" }}>
                          {t("A shortcut to your favorite words.")}
                        </NotebookText>
                        <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
                          {t("Save this search and category selection to use it again.")}
                        </NotebookText>
                        <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
                          {t("No saved filters yet.")}
                        </NotebookText>
                      </View>
                    )}
                    {saved.map((filter) => (
                      <View
                        key={filter.id}
                        style={{
                          gap: 8,
                          backgroundColor: theme.surface,
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderColor: theme.divider,
                        }}
                      >
                        <NotebookText emphasis>
                          {filter.icon} {filter.name}
                          {activeId === filter.id ? ` · ${t("Applied")}` : ""}
                        </NotebookText>
                        <NotebookText variant="secondary">
                          {filter.search || "—"} ·{" "}
                          {categories
                            .filter((c) => filter.categoryIds.includes(c.id))
                            .map((c) => c.name)
                            .join(", ") || "—"}
                        </NotebookText>
                        <ActionButton
                          label={t("applyFilter", { name: filter.name })}
                          variant="secondary"
                          onPress={() => onApplySaved(filter)}
                        />
                        <ActionButton
                          label={t("deleteFilter", { name: filter.name })}
                          variant="secondary"
                          onPress={() => {
                            setTarget(filter);
                            setChild("delete");
                          }}
                        />
                      </View>
                    ))}
                    <ActionButton
                      label={t("Save current selection")}
                      variant="secondary"
                      onPress={() => {
                        setError("");
                        setChild("save");
                      }}
                    />
                  </>
                )}
                <NotebookText>{t("termCount", { count: preview.length })}</NotebookText>
                <ActionButton
                  label={t("Apply")}
                  onPress={() => {
                    if (onApply(validIds, draftDisplay)) onClose();
                    else setError(t("Could not save your settings. Please try again."));
                  }}
                />
                <ActionButton label={t("Cancel")} variant="secondary" onPress={onClose} />
              </>
            )}
            {error && child !== "save" && child !== "delete" ? (
              <Text accessibilityRole="alert">{error}</Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
