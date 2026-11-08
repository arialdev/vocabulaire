import { useModalFocus } from "../../ui/use-modal-focus";
import { useReducedMotion } from "../../ui/use-reduced-motion";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View as NativeView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useServices } from "../../data/services";
import { ScrollView, Text, View, useTheme } from "../../ui/theme";
import { NotebookText, Icon } from "../../ui/typography";
import { ActionButton } from "../../ui/action-button";
import { AppBar } from "../../ui/layout";
import { IconButton, MenuAction } from "../../ui/controls";

export default function TermDetails() {
  const { id, collectionId: collection } = useLocalSearchParams<{
    id: string;
    collectionId: string;
  }>();
  const collectionId = Number(collection);
  const { repository, revision, refresh } = useServices();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const menuOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const menuHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  useModalFocus(menu, menuHeading, menuOpener);
  void revision;
  const term = repository.listTerms(collectionId).find((item) => item.id === Number(id));
  if (!term) return <Text>{t("Term or collection not found.")}</Text>;
  const collectionRow = repository.listCollections().find((item) => item.id === collectionId);
  const categories = repository
    .listCategories(collectionId)
    .filter((item) => term.categoryIds.includes(item.id));
  const close = () => {
    setMenu(false);
    setConfirming(false);
    setError("");
  };
  const remove = () => {
    try {
      repository.deleteTerm(collectionId, term.id);
      close();
      refresh();
      router.back();
    } catch {
      setError(t("Could not delete term."));
    }
  };
  const edit = () => {
    close();
    router.push({ pathname: "/term/edit", params: { collectionId, id: term.id } });
  };
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 12 }}>
        <AppBar
          title={collectionRow ? `${collectionRow.icon} ${collectionRow.name}` : t("Term details")}
          onBack={() => router.back()}
          backLabel={t("Back")}
          trailing={
            <Pressable
              accessibilityRole="button"
              ref={menuOpener}
              accessibilityLabel={t("termActions", { name: term.original })}
              onPress={() => setMenu(true)}
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="more" />
            </Pressable>
          }
        />
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: Math.max(insets.bottom, 24),
          gap: 20,
          flexGrow: 1,
        }}
      >
        <NotebookText variant="display">{term.original}</NotebookText>
        <NotebookText variant="section">{term.translation}</NotebookText>
        {term.notes ? (
          <View
            style={{
              gap: 8,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.divider,
              backgroundColor: theme.surface,
            }}
          >
            <NotebookText emphasis>{t("Notes")}</NotebookText>
            <NotebookText>{term.notes}</NotebookText>
          </View>
        ) : null}
        {(["grammatical", "thematic"] as const).map((kind) => {
          const group = categories.filter((category) => category.kind === kind);
          if (!group.length) return null;
          return (
            <View key={kind} style={{ gap: 8 }}>
              <NotebookText emphasis>
                {t(kind === "grammatical" ? "Grammatical" : "Thematic")}
              </NotebookText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {group.map((category) => (
                  <View
                    key={category.id}
                    style={{
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor:
                        kind === "grammatical" ? theme.grammaticalFill : theme.thematicFill,
                    }}
                  >
                    <NotebookText
                      style={{
                        color: kind === "grammatical" ? theme.grammaticalText : theme.thematicText,
                      }}
                    >
                      {kind === "grammatical" ? "Aa" : "♧"} {category.name}
                    </NotebookText>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
        <View style={{ flexGrow: 1 }} />
        <ActionButton label={t("Edit term")} onPress={edit} />
      </ScrollView>
      <Modal
        visible={menu}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.48)",
            justifyContent: confirming ? "center" : "flex-end",
            paddingHorizontal: confirming ? 24 : 0,
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
              padding: 24,
              paddingBottom: confirming ? 24 : Math.max(insets.bottom, 24),
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderBottomLeftRadius: confirming ? 24 : 0,
              borderBottomRightRadius: confirming ? 24 : 0,
              backgroundColor: theme.surface,
              gap: 12,
            }}
          >
            {!confirming && (
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
              style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.surface }}
            >
              <Pressable
                ref={menuHeading}
                accessible
                accessibilityRole="header"
                style={{ flex: 1 }}
              >
                <NotebookText variant="headword" emphasis>
                  {confirming ? t("Delete term?") : term.original}
                </NotebookText>
              </Pressable>
              {!confirming && <IconButton name="close" label={t("Close")} onPress={close} />}
            </View>
            {confirming ? (
              <>
                <NotebookText>{t("confirmDeleteTerm", { name: term.original })}</NotebookText>
                <ActionButton label={t("Cancel")} variant="secondary" onPress={close} />
                <ActionButton label={t("Delete")} variant="destructive" onPress={remove} />
              </>
            ) : (
              <>
                <MenuAction name="edit" label={t("Edit term")} onPress={edit} />
                <MenuAction
                  name="delete"
                  label={t("Delete")}
                  destructive
                  onPress={() => setConfirming(true)}
                />
                <ActionButton label={t("Cancel")} variant="secondary" onPress={close} />
              </>
            )}
            {error ? <Text accessibilityRole="alert">{error}</Text> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
