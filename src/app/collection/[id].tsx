import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Button, FlatList, Modal, Pressable } from "react-native";
import { ScrollView, Text, TextInput, View } from "../../ui/theme";
import { useServices } from "../../data/services";
import { EmojiControl } from "../../ui/emoji-control";
import { queryTerms, type TermQuery } from "../../domain/term-query";
import { shareVocabularyPdf } from "../../platform/pdf-files";
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
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [appliedFilter, setAppliedFilter] = useState<{ id: number; name: string; icon: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterIcon, setFilterIcon] = useState("⭐");
  const [detailed, setDetailed] = useState(false);
  const [sortField, setSortField] = useState<TermQuery["sortField"]>("original");
  const [direction, setDirection] = useState<TermQuery["direction"]>("asc");
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfInProgress = useRef(false);
  void revision;
  let collection: ReturnType<typeof repository.listCollections>[number] | undefined;
  let rows: ReturnType<typeof repository.listTerms> = [];
  let loadError = "";
  let categoryRows: ReturnType<typeof repository.listCategories> = [];
  let total = 0;
  let saved: ReturnType<typeof repository.listFilters> = [];
  try {
    collection = repository.listCollections().find((item) => item.id === collectionId);
    const allTerms = repository.listTerms(collectionId);
    total = allTerms.length;
    categoryRows = repository.listCategories(collectionId);
    saved = repository.listFilters(collectionId);
    rows = queryTerms(allTerms, categoryRows, {
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
  } catch {
    loadError = t("Could not load vocabulary.");
  }
  if (loadError) return <Text accessibilityRole="alert">{loadError}</Text>;
  if (!collection) return <Text>{t("Collection not found.")}</Text>;
  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {collection.icon} {collection.name}
      </Text>
      <TextInput
        accessibilityLabel={t("Search vocabulary")}
        placeholder={t("Search")}
        value={search}
        onChangeText={(value) => {
          setSearch(value);
          setAppliedFilter(undefined);
        }}
        style={{ borderWidth: 1, padding: 10 }}
      />
      <Button
        title={showFilters ? t("Hide filters") : t("Filters and display")}
        onPress={() => setShowFilters(!showFilters)}
      />
      <Modal
        visible={showFilters}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>{t("Filters and display")}</Text>
          <Button
            title={t("sortLabel", {
              field: t(
                sortField === "original"
                  ? "sortOriginal"
                  : sortField === "translation"
                    ? "sortTranslation"
                    : "sortUpdated",
              ),
            })}
            onPress={() =>
              setSortField(
                sortField === "original"
                  ? "translation"
                  : sortField === "translation"
                    ? "updated"
                    : "original",
              )
            }
          />
          <Button
            title={t("directionLabel", {
              direction: t(direction === "asc" ? "ascending" : "descending"),
            })}
            onPress={() => setDirection(direction === "asc" ? "desc" : "asc")}
          />
          <Button
            title={detailed ? t("Compact view") : t("Detailed view")}
            onPress={() => setDetailed(!detailed)}
          />
          {categoryRows.map((category) => (
            <Button
              key={category.id}
              title={`${selectedCategories.includes(category.id) ? "✓ " : ""}${category.name} (${t(category.kind === "grammatical" ? "Grammatical" : "Thematic")})`}
              onPress={() => {
                setAppliedFilter(undefined);
                setSelectedCategories((ids) =>
                  ids.includes(category.id)
                    ? ids.filter((id) => id !== category.id)
                    : [...ids, category.id],
                );
              }}
            />
          ))}
          <Button
            title={t("Clear category filters")}
            onPress={() => {
              setSelectedCategories([]);
              setAppliedFilter(undefined);
            }}
          />
          <Text>{t("Saved filters")}</Text>
          {saved.map((filter) => (
            <View key={filter.id} style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                style={{ flex: 1, padding: 12 }}
                accessibilityRole="button"
                accessibilityLabel={t("applyFilter", { name: filter.name })}
                onPress={() => {
                  setSearch(filter.search);
                  setSelectedCategories(filter.categoryIds);
                  setAppliedFilter({ id: filter.id, name: filter.name, icon: filter.icon });
                  setShowFilters(false);
                }}
              >
                <Text>
                  {filter.icon} {filter.name}
                </Text>
              </Pressable>
              <Button
                title={t("Delete")}
                onPress={() =>
                  Alert.alert(t("Delete saved filter?"), filter.name, [
                    { text: t("Cancel"), style: "cancel" },
                    {
                      text: t("Delete"),
                      style: "destructive",
                      onPress: () => {
                        try {
                          repository.deleteFilter(collectionId, filter.id);
                          if (appliedFilter?.id === filter.id) setAppliedFilter(undefined);
                          refresh();
                        } catch {
                          setError(t("Could not delete saved filter."));
                        }
                      },
                    },
                  ])
                }
              />
            </View>
          ))}
          <TextInput
            accessibilityLabel={t("Saved filter name")}
            placeholder={t("Saved filter name")}
            value={filterName}
            onChangeText={setFilterName}
            style={{ borderWidth: 1, padding: 10 }}
          />
          <EmojiControl
            label={t("Choose filter icon")}
            value={filterIcon}
            onChange={setFilterIcon}
          />
          <Button
            title={t("Save current filter")}
            onPress={() => {
              try {
                repository.saveFilter({
                  collectionId,
                  name: filterName,
                  icon: filterIcon,
                  search,
                  categoryIds: selectedCategories.filter((id) =>
                    categoryRows.some((category) => category.id === id),
                  ),
                });
                setFilterName("");
                refresh();
              } catch {
                setError(t("saveFilterError"));
              }
            }}
          />
          {error ? <Text accessibilityRole="alert">{error}</Text> : null}
          <Button title={t("Done")} onPress={() => setShowFilters(false)} />
        </ScrollView>
      </Modal>
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          total ? (
            <View>
              <Text>{t("No matching terms.")}</Text>
              <Button
                title={t("clearSearchAndFilters")}
                onPress={() => {
                  setSearch("");
                  setSelectedCategories([]);
                  setAppliedFilter(undefined);
                }}
              />
            </View>
          ) : (
            <Text>{t("No terms yet.")}</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 12 }}
              accessibilityRole="button"
              accessibilityLabel={item.original}
              onPress={() =>
                router.push({ pathname: "/term/[id]", params: { collectionId, id: item.id } })
              }
            >
              <Text>
                {item.original} — {item.translation}
              </Text>
              {detailed && item.notes ? <Text>{item.notes}</Text> : null}
              {detailed && (
                <Text>
                  {categoryRows
                    .filter((category) => item.categoryIds.includes(category.id))
                    .map((category) => category.name)
                    .join(", ")}
                </Text>
              )}
            </Pressable>
            <Button
              title={t("Delete")}
              onPress={() =>
                Alert.alert(t("Delete term?"), t("confirmDeleteTerm", { name: item.original }), [
                  { text: t("Cancel"), style: "cancel" },
                  {
                    text: t("Delete"),
                    style: "destructive",
                    onPress: () => {
                      try {
                        repository.deleteTerm(collectionId, item.id);
                        refresh();
                      } catch {
                        setError(t("Could not delete term."));
                      }
                    },
                  },
                ])
              }
            />
          </View>
        )}
      />
      <Button
        title={t("Export PDF")}
        disabled={pdfBusy}
        onPress={() => {
          if (collection && !pdfInProgress.current) {
            pdfInProgress.current = true;
            setPdfBusy(true);
            void shareVocabularyPdf(
              collection,
              rows,
              categoryRows,
              i18n.resolvedLanguage ?? "en",
              appliedFilter,
            )
              .catch((e: unknown) =>
                setError(
                  e instanceof Error
                    ? t(e.message, { defaultValue: t("pdfExportError") })
                    : t("pdfExportError"),
                ),
              )
              .finally(() => {
                pdfInProgress.current = false;
                setPdfBusy(false);
              });
          }
        }}
      />
      <Button
        title={t("Word of the day")}
        onPress={() => router.push({ pathname: "/collection/daily", params: { collectionId } })}
      />
      <Button
        title={t("Manage categories")}
        onPress={() =>
          router.push({ pathname: "/collection/categories", params: { collectionId } })
        }
      />
      <Button
        title={t("Add term")}
        onPress={() => router.push({ pathname: "/term/edit", params: { collectionId } })}
      />
    </View>
  );
}
