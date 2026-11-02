import { useModalFocus } from "../ui/use-modal-focus";
import { useReducedMotion } from "../ui/use-reduced-motion";
import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View as NativeView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, useTheme } from "../ui/theme";
import { NotebookText, Icon } from "../ui/typography";
import { ActionButton } from "../ui/action-button";
import { IconButton, MenuAction } from "../ui/controls";
import { useServices } from "../data/services";
import { Intro } from "../features/onboarding/intro";
import type { Repository } from "../data/repository";

type Summary = ReturnType<Repository["listCollectionSummaries"]>[number];
type LoadState = { status: "loading" | "error" } | { status: "ready"; items: Summary[] };

export default function HomeScreen() {
  const { t } = useTranslation();
  const { repository, refresh, revision, restoreNotice, setRestoreNotice } = useServices();
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState("");
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [retry, setRetry] = useState(0);
  const [target, setTarget] = useState<Summary>();
  const [confirming, setConfirming] = useState(false);
  const actionNodes = useRef(new Map<number, React.ElementRef<typeof NativeView>>());
  const actionOpener = useRef<React.ElementRef<typeof NativeView> | null>(null);
  const actionHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  const createOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  useModalFocus(!!target, actionHeading, actionOpener);
  const complete = repository.getPreferences().onboardingComplete;
  useEffect(() => {
    if (!complete) return;
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) setLoad({ status: "loading" });
        return repository.listCollectionSummaries();
      })
      .then(
        (items) => {
          if (active) setLoad({ status: "ready", items });
        },
        () => {
          if (active) setLoad({ status: "error" });
        },
      );
    return () => {
      active = false;
    };
  }, [complete, repository, revision, retry]);
  if (!complete) return <Intro />;
  const open = (id: number) => {
    try {
      repository.updatePreferences({ selectedCollectionId: id });
      refresh();
      router.push({ pathname: "/collection/[id]", params: { id } });
    } catch {
      setError(t("Could not select this collection."));
    }
  };
  const closeActions = () => {
    setTarget(undefined);
    setConfirming(false);
  };
  const deleteCollection = (item: Summary) => {
    try {
      repository.deleteCollection(item.id);
      actionOpener.current = createOpener.current;
      closeActions();
      refresh();
    } catch {
      setError(t("Could not delete this collection."));
      closeActions();
    }
  };
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.bar}>
        <NotebookText variant="pageTitle" emphasis>
          Vocabulaire
        </NotebookText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Settings")}
          onPress={() => router.push("/settings")}
          style={styles.iconButton}
        >
          <Icon name="settings" />
        </Pressable>
      </View>
      <FlatList
        data={load.status === "ready" ? load.items : []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.heading}>
            <NotebookText variant="pageTitle" emphasis>
              {t("Your collections")}
            </NotebookText>
            <NotebookText variant="body" style={{ color: theme.secondaryText }}>
              {t("A home for every word you find.")}
            </NotebookText>
            {error ? <Text accessibilityRole="alert">{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          load.status === "loading" ? (
            <Text>{t("Loading…")}</Text>
          ) : load.status === "error" ? (
            <View style={{ gap: 12 }}>
              <Text accessibilityRole="alert">{t("Could not load collections.")}</Text>
              <ActionButton
                label={t("Retry")}
                variant="secondary"
                onPress={() => setRetry((n) => n + 1)}
              />
            </View>
          ) : (
            <View style={{ gap: 16, alignItems: "center", paddingVertical: 32 }}>
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 88,
                  height: 108,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.controlOutline,
                  backgroundColor: theme.surface,
                  flexDirection: "row",
                  overflow: "hidden",
                }}
              >
                <View style={{ width: 12, backgroundColor: theme.primary }} />
                <View style={{ flex: 1, backgroundColor: theme.surface, padding: 16, gap: 8 }}>
                  {[0, 1, 2].map((line) => (
                    <View key={line} style={{ height: 2, backgroundColor: theme.divider }} />
                  ))}
                </View>
              </View>
              <NotebookText variant="headword" emphasis style={{ textAlign: "center" }}>
                {t("emptyNotebookTitle")}
              </NotebookText>
              <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
                {t("Create a collection to start adding vocabulary.")}
              </NotebookText>
              <ActionButton
                label={t("Restore backup")}
                variant="secondary"
                onPress={() => router.push("/backup")}
              />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: theme.divider }]}>
            <Pressable
              onPress={() => open(item.id)}
              accessibilityRole="button"
              accessibilityLabel={t("openCollection", { name: item.name })}
              style={styles.rowContent}
            >
              <View
                style={[
                  styles.tile,
                  { backgroundColor: theme.surface, borderColor: theme.divider },
                ]}
              >
                <Text style={{ fontSize: 26 }}>{item.icon}</Text>
              </View>
              <View style={styles.grow}>
                <NotebookText variant="section">{item.name}</NotebookText>
                <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
                  {t("termCount", { count: item.termCount })}
                </NotebookText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("collectionActions", { name: item.name })}
              ref={(node) => {
                if (node) actionNodes.current.set(item.id, node);
                else actionNodes.current.delete(item.id);
              }}
              onPress={() => {
                actionOpener.current = actionNodes.current.get(item.id) ?? null;
                setTarget(item);
              }}
              style={styles.iconButton}
            >
              <Icon name="more" />
            </Pressable>
          </View>
        )}
      />
      <View style={styles.footer}>
        {restoreNotice && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              backgroundColor: theme.selected,
            }}
          >
            <NotebookText accessibilityLiveRegion="polite" style={{ flex: 1 }}>
              {t("Backup restored.")}
            </NotebookText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("Dismiss")}
              onPress={() => {
                setRestoreNotice(false);
              }}
              style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 12 }}
            >
              <NotebookText emphasis>{t("OK")}</NotebookText>
            </Pressable>
          </View>
        )}
        <ActionButton
          ref={createOpener}
          label={t("Create collection")}
          onPress={() => router.push("/collection/edit")}
        />
      </View>
      <Modal
        visible={!!target}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={closeActions}
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
            style={StyleSheet.absoluteFill}
            onPress={closeActions}
            accessibilityLabel={t("Cancel")}
            accessibilityRole="button"
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 24) },
              confirming && { borderRadius: 24, paddingBottom: 24 },
            ]}
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
                ref={actionHeading}
                accessible
                accessibilityRole="header"
                style={{ flex: 1 }}
              >
                <NotebookText variant="headword" emphasis>
                  {confirming ? t("Delete collection?") : target?.name}
                </NotebookText>
              </Pressable>
              {!confirming && <IconButton name="close" label={t("Close")} onPress={closeActions} />}
            </View>
            {confirming ? (
              <>
                <NotebookText>{t("confirmDeleteCollection", { name: target?.name })}</NotebookText>
                <ActionButton
                  label={t("Cancel")}
                  variant="secondary"
                  onPress={() => setConfirming(false)}
                />
                <ActionButton
                  label={t("Delete collection")}
                  variant="destructive"
                  onPress={() => {
                    if (target) deleteCollection(target);
                  }}
                />
              </>
            ) : (
              <>
                <MenuAction
                  name="edit"
                  label={t("Edit collection")}
                  onPress={() => {
                    const id = target?.id;
                    closeActions();
                    if (id) router.push({ pathname: "/collection/edit", params: { id } });
                  }}
                />
                <MenuAction
                  name="delete"
                  label={t("Delete collection")}
                  destructive
                  onPress={() => setConfirming(true)}
                />
                <ActionButton label={t("Cancel")} variant="secondary" onPress={closeActions} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  bar: {
    minHeight: 56,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: { width: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  heading: { gap: 8, paddingTop: 32, paddingBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingVertical: 14 },
  rowContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 16 },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flex: 1 },
  footer: { paddingHorizontal: 24 },
  sheet: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 12 },
});
