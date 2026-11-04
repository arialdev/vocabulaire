import { useModalFocus } from "../../ui/use-modal-focus";
import { useReducedMotion } from "../../ui/use-reduced-motion";
import { useTranslation } from "react-i18next";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View as NativeView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, TextInput, View, useTheme } from "../../ui/theme";
import { NotebookText, Icon } from "../../ui/typography";
import { ActionButton } from "../../ui/action-button";
import { IconButton, MenuAction } from "../../ui/controls";
import { useServices } from "../../data/services";
import { FilterSheet } from "./filter-sheet";
import { queryTerms, type TermQuery } from "../../domain/term-query";
import { PdfSheet } from "../export/pdf-sheet";
import i18n from "../../i18n";

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CollectionContents key={id} id={id} />;
}

function CollectionContents({ id }: { id: string }) {
  const { t } = useTranslation();
  const collectionId = Number(id);
  const { repository, revision, refresh } = useServices();
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const stackedToolbar = width <= 320 || fontScale >= 1.5;
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [appliedFilter, setAppliedFilter] = useState<{ id: number; name: string; icon: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const filterOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const toolsOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const preferences = repository.getPreferences();
  const [detailed, setDetailed] = useState(preferences.termView === "detailed");
  const [sortField, setSortField] = useState<TermQuery["sortField"]>(preferences.sortField);
  const [direction, setDirection] = useState<TermQuery["direction"]>(preferences.sortDirection);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [termTarget, setTermTarget] = useState<ReturnType<typeof repository.listTerms>[number]>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toolsHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  const termHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  const addOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const termOpener = useRef<React.ElementRef<typeof NativeView> | null>(null);
  const termNodes = useRef(new Map<number, React.ElementRef<typeof NativeView>>());
  useModalFocus(showFilters, undefined, filterOpener);
  useModalFocus(toolsOpen, toolsHeading, toolsOpener);
  useModalFocus(!!termTarget, termHeading, termOpener);
  type Data = {
    collection: ReturnType<typeof repository.listCollections>[number] | undefined;
    terms: ReturnType<typeof repository.listTerms>;
    categories: ReturnType<typeof repository.listCategories>;
    saved: ReturnType<typeof repository.listFilters>;
  };
  const [load, setLoad] = useState<
    { status: "loading" } | { status: "error" } | { status: "ready"; data: Data }
  >({ status: "loading" });
  const [readAttempt, setReadAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => {
        if (!active) return;
        const collection = repository.listCollections().find((item) => item.id === collectionId);
        const terms = repository.listTerms(collectionId);
        const categories = repository.listCategories(collectionId);
        const saved = repository.listFilters(collectionId);
        if (active) setLoad({ status: "ready", data: { collection, terms, categories, saved } });
      })
      .catch(() => {
        if (active) setLoad({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [repository, collectionId, revision, readAttempt]);
  useEffect(() => {
    if (load.status !== "ready") return;
    const ids = new Set(load.data.categories.map((category) => category.id));
    const filtered = selectedCategories.filter((id) => ids.has(id));
    if (filtered.length !== selectedCategories.length) {
      void Promise.resolve().then(() => {
        setSelectedCategories(filtered);
        setAppliedFilter(undefined);
      });
    }
  }, [load, selectedCategories]);
  if (load.status === "loading") return <Text>{t("Loading…")}</Text>;
  if (load.status === "error")
    return (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Text accessibilityRole="alert">{t("Could not load vocabulary.")}</Text>
        <ActionButton
          label={t("Retry")}
          variant="secondary"
          onPress={() => setReadAttempt((value) => value + 1)}
        />
      </View>
    );
  const { collection, terms: allTerms, categories: categoryRows, saved } = load.data;
  if (!collection) return <Text>{t("Collection not found.")}</Text>;
  const total = allTerms.length;
  const rows = queryTerms(allTerms, categoryRows, {
    search,
    grammaticalIds: categoryRows
      .filter((item) => item.kind === "grammatical" && selectedCategories.includes(item.id))
      .map((item) => item.id),
    thematicIds: categoryRows
      .filter((item) => item.kind === "thematic" && selectedCategories.includes(item.id))
      .map((item) => item.id),
    sortField,
    direction,
  });
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{ minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Back")}
          onPress={() => router.back()}
          style={{ width: 48, minHeight: 48, justifyContent: "center", alignItems: "center" }}
        >
          <Icon name="back" />
        </Pressable>
        <NotebookText variant="section" emphasis style={{ flex: 1 }}>
          {collection.icon} {collection.name}
        </NotebookText>
        <Pressable
          accessibilityRole="button"
          ref={toolsOpener}
          accessibilityLabel={t("Collection tools")}
          onPress={() => setToolsOpen(true)}
          style={{ width: 48, minHeight: 48, justifyContent: "center", alignItems: "center" }}
        >
          <Icon name="more" />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 24, gap: 12 }}>
        <TextInput
          accessibilityLabel={t("Search vocabulary")}
          placeholder={t("Search")}
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setAppliedFilter(undefined);
          }}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            minHeight: 56,
            paddingHorizontal: 16,
            backgroundColor: theme.input,
          }}
        />
        <View
          style={{
            flexDirection: stackedToolbar ? "column" : "row",
            flexWrap: "wrap",
            alignItems: stackedToolbar ? "stretch" : "center",
            gap: 8,
          }}
        >
          <NotebookText
            variant="secondary"
            style={stackedToolbar ? undefined : { flexGrow: 1, flexShrink: 1 }}
          >
            {t("termCount", { count: rows.length })} ·{" "}
            {t(detailed ? "Detailed view" : "Compact view")} ·{" "}
            {t(
              sortField === "original"
                ? "sortOriginal"
                : sortField === "translation"
                  ? "sortTranslation"
                  : "sortUpdated",
            )}{" "}
            ·{" "}
            {t(
              sortField === "updated"
                ? direction === "asc"
                  ? "Oldest first"
                  : "Newest first"
                : direction === "asc"
                  ? "A–Z"
                  : "Z–A",
            )}
          </NotebookText>
          <Pressable
            ref={filterOpener}
            accessibilityRole="button"
            accessibilityLabel={t("Filters and display")}
            onPress={() => setShowFilters(true)}
            style={{
              minHeight: 48,
              justifyContent: "center",
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.controlOutline,
            }}
          >
            <NotebookText variant="secondary">{t("Filters and display")}</NotebookText>
          </Pressable>
        </View>
        {appliedFilter && (
          <NotebookText variant="secondary">
            {appliedFilter.icon} {appliedFilter.name} · {t("Applied")}
          </NotebookText>
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {categoryRows
            .filter((category) => selectedCategories.includes(category.id))
            .map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={t("removeCategoryFilter", { name: category.name })}
                onPress={() => {
                  setSelectedCategories((ids) => ids.filter((id) => id !== category.id));
                  setAppliedFilter(undefined);
                }}
                style={{
                  minHeight: 48,
                  justifyContent: "center",
                  paddingHorizontal: 12,
                  backgroundColor: theme.selected,
                  borderRadius: 12,
                }}
              >
                <NotebookText>{category.name} ×</NotebookText>
              </Pressable>
            ))}
        </View>
      </View>
      {showFilters && (
        <FilterSheet
          collectionId={collectionId}
          search={search}
          categories={categoryRows}
          terms={allTerms}
          selected={selectedCategories}
          display={{ detailed, field: sortField, direction }}
          saved={saved}
          activeId={appliedFilter?.id}
          repository={repository}
          refresh={refresh}
          onClose={() => setShowFilters(false)}
          onApply={(ids, next) => {
            try {
              repository.updatePreferences({
                termView: next.detailed ? "detailed" : "compact",
                sortField: next.field,
                sortDirection: next.direction,
              });
              if (
                ids.length !== selectedCategories.length ||
                ids.some((id) => !selectedCategories.includes(id))
              )
                setAppliedFilter(undefined);
              setSelectedCategories(ids);
              setDetailed(next.detailed);
              setSortField(next.field);
              setDirection(next.direction);
              refresh();
              return true;
            } catch {
              return false;
            }
          }}
          onApplySaved={(filter) => {
            setSearch(filter.search);
            setSelectedCategories(
              filter.categoryIds.filter((id) =>
                categoryRows.some((category) => category.id === id),
              ),
            );
            setAppliedFilter({ id: filter.id, name: filter.name, icon: filter.icon });
            setShowFilters(false);
          }}
          onDeleteSaved={(filterId) => {
            if (appliedFilter?.id === filterId) setAppliedFilter(undefined);
          }}
        />
      )}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={
          total ? (
            <View
              style={{
                flexGrow: 1,
                gap: 16,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 24,
              }}
            >
              <Icon name="search" size={56} color={theme.primary} />
              <NotebookText variant="headword" emphasis style={{ textAlign: "center" }}>
                {t("No words on this page.")}
              </NotebookText>
              <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
                {t("Try another search or clear your filters to reveal saved expressions.")}
              </NotebookText>
              <View style={{ alignSelf: "stretch" }}>
                <ActionButton
                  label={t("clearSearchAndFilters")}
                  onPress={() => {
                    setSearch("");
                    setSelectedCategories([]);
                    setAppliedFilter(undefined);
                  }}
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                flexGrow: 1,
                gap: 16,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 24,
              }}
            >
              <Icon name="categories" size={56} color={theme.primary} />
              <NotebookText variant="headword" emphasis style={{ textAlign: "center" }}>
                {t("A new word is a good beginning.")}
              </NotebookText>
              <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
                {t("Add an expression and its translation. The rest can come later.")}
              </NotebookText>
            </View>
          )
        }
        ListFooterComponent={
          total > 0 && !detailed ? (
            <NotebookText
              variant="secondary"
              style={{ color: theme.secondaryText, paddingVertical: 16 }}
            >
              {t("entryCount", { count: rows.length })}
            </NotebookText>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: theme.divider,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.original}
              onPress={() =>
                router.push({ pathname: "/term/[id]", params: { collectionId, id: item.id } })
              }
              style={{ flex: 1, paddingVertical: 16, gap: 4 }}
            >
              <NotebookText variant="headword">{item.original}</NotebookText>
              <NotebookText>{item.translation}</NotebookText>
              {detailed && item.notes ? (
                <NotebookText variant="secondary" numberOfLines={2}>
                  {item.notes}
                </NotebookText>
              ) : null}
              {detailed && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {categoryRows
                    .filter((category) => item.categoryIds.includes(category.id))
                    .map((category) => (
                      <View
                        key={category.id}
                        style={{
                          backgroundColor:
                            category.kind === "grammatical"
                              ? theme.grammaticalFill
                              : theme.thematicFill,
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                      >
                        <NotebookText
                          variant="secondary"
                          style={{
                            color:
                              category.kind === "grammatical"
                                ? theme.grammaticalText
                                : theme.thematicText,
                          }}
                        >
                          {category.kind === "grammatical" ? "Aa" : "♧"} {category.name}
                        </NotebookText>
                      </View>
                    ))}
                </View>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("termActions", { name: item.original })}
              ref={(node) => {
                if (node) termNodes.current.set(item.id, node);
                else termNodes.current.delete(item.id);
              }}
              onPress={() => {
                termOpener.current = termNodes.current.get(item.id) ?? null;
                setTermTarget(item);
                setConfirmDelete(false);
              }}
              style={{ width: 48, minHeight: 48, justifyContent: "center", alignItems: "center" }}
            >
              <Icon name="more" />
            </Pressable>
          </View>
        )}
      />
      <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) }}>
        <ActionButton
          ref={addOpener}
          label={t("Add term")}
          onPress={() => router.push({ pathname: "/term/edit", params: { collectionId } })}
        />
      </View>
      <Modal
        visible={toolsOpen}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={() => setToolsOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Cancel")}
          onPress={() => setToolsOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.48)" }}
        />
        <View
          accessibilityViewIsModal
          style={{
            padding: 24,
            paddingBottom: Math.max(insets.bottom, 24),
            gap: 12,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: theme.surface,
            maxHeight: "85%",
          }}
        >
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
          <View
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.surface }}
          >
            <Pressable ref={toolsHeading} accessible accessibilityRole="header" style={{ flex: 1 }}>
              <NotebookText variant="headword" emphasis>
                {t("Collection tools")}
              </NotebookText>
            </Pressable>
            <IconButton name="close" label={t("Close")} onPress={() => setToolsOpen(false)} />
          </View>
          <ScrollView>
            <MenuAction
              name="daily"
              label={t("Word of the day")}
              onPress={() => {
                setToolsOpen(false);
                router.push({ pathname: "/collection/daily", params: { collectionId } });
              }}
            />
            <MenuAction
              name="categories"
              label={t("Flashcard practice")}
              onPress={() => {
                setToolsOpen(false);
                router.push({ pathname: "/collection/practice", params: { collectionId } });
              }}
            />
            <MenuAction
              name="categories"
              label={t("Manage categories")}
              onPress={() => {
                setToolsOpen(false);
                router.push({ pathname: "/collection/categories", params: { collectionId } });
              }}
            />
            <MenuAction
              name="pdf"
              label={t("Export PDF")}
              onPress={() => {
                setToolsOpen(false);
                setPdfOpen(true);
              }}
            />
            <MenuAction
              name="edit"
              label={t("Edit collection")}
              onPress={() => {
                setToolsOpen(false);
                router.push({ pathname: "/collection/edit", params: { id: collectionId } });
              }}
            />
            <ActionButton
              label={t("Cancel")}
              variant="secondary"
              onPress={() => setToolsOpen(false)}
            />
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={!!termTarget}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={() => {
          setTermTarget(undefined);
          setConfirmDelete(false);
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Cancel")}
          onPress={() => {
            setTermTarget(undefined);
            setConfirmDelete(false);
          }}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.48)" }}
        />
        <View
          accessibilityViewIsModal
          style={{
            padding: 24,
            paddingBottom: Math.max(insets.bottom, 24),
            gap: 12,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: theme.surface,
          }}
        >
          <Pressable ref={termHeading} accessible accessibilityRole="header">
            <NotebookText variant="section" emphasis>
              {confirmDelete ? t("Delete term?") : termTarget?.original}
            </NotebookText>
          </Pressable>
          {confirmDelete ? (
            <>
              <NotebookText>{t("confirmDeleteTerm", { name: termTarget?.original })}</NotebookText>
              <ActionButton
                label={t("Delete")}
                onPress={() => {
                  if (!termTarget) return;
                  try {
                    repository.deleteTerm(collectionId, termTarget.id);
                    termOpener.current = addOpener.current;
                    setTermTarget(undefined);
                    setConfirmDelete(false);
                    refresh();
                  } catch {
                    setError(t("Could not delete term."));
                    setTermTarget(undefined);
                    setConfirmDelete(false);
                  }
                }}
              />
            </>
          ) : (
            <>
              <ActionButton
                label={t("Edit term")}
                variant="secondary"
                onPress={() => {
                  const termId = termTarget?.id;
                  setTermTarget(undefined);
                  if (termId)
                    router.push({ pathname: "/term/edit", params: { collectionId, id: termId } });
                }}
              />
              <ActionButton
                label={t("Delete")}
                variant="secondary"
                onPress={() => setConfirmDelete(true)}
              />
            </>
          )}
          <ActionButton
            label={t("Cancel")}
            variant="secondary"
            onPress={() => {
              setTermTarget(undefined);
              setConfirmDelete(false);
            }}
          />
        </View>
      </Modal>
      <PdfSheet
        visible={pdfOpen}
        returnFocus={toolsOpener}
        onClose={() => setPdfOpen(false)}
        snapshot={{
          collection,
          terms: rows,
          categories: categoryRows,
          language: i18n.resolvedLanguage ?? "en",
          filter: appliedFilter,
          layout: detailed ? "detailed" : "compact",
        }}
        scope={{
          search,
          categories: categoryRows
            .filter((category) => selectedCategories.includes(category.id))
            .map((category) => category.name),
          order: `${t(sortField === "original" ? "sortOriginal" : sortField === "translation" ? "sortTranslation" : "sortUpdated")} · ${t(sortField === "updated" ? (direction === "asc" ? "Oldest first" : "Newest first") : direction === "asc" ? "A–Z" : "Z–A")}`,
        }}
      />
    </View>
  );
}
