import { useModalFocus } from "../../ui/use-modal-focus";
import { useReducedMotion } from "../../ui/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, View as NativeView } from "react-native";
import { File } from "expo-file-system";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "../../ui/action-button";
import { IconButton } from "../../ui/controls";
import { NotebookText } from "../../ui/typography";
import { ScrollView, Text, View, useTheme } from "../../ui/theme";
import {
  capturePdfSnapshot,
  prepareVocabularyPdf,
  sharePreparedVocabularyPdf,
  type PdfSnapshot,
  type PreparedPdf,
} from "../../platform/pdf-files";

type Scope = { search: string; categories: string[]; order: string };
export function PdfSheet({
  visible,
  snapshot,
  scope,
  onClose,
  returnFocus,
}: {
  visible: boolean;
  snapshot: PdfSnapshot;
  scope: Scope;
  onClose: () => void;
  returnFocus?: React.RefObject<React.ElementRef<typeof NativeView> | null>;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [prepared, setPrepared] = useState<PreparedPdf>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preparedScope, setPreparedScope] = useState<Scope>();
  const mounted = useRef(true);
  const currentFile = useRef<PreparedPdf | undefined>(undefined);
  const operation = useRef(false);
  const headingRef = useRef<React.ElementRef<typeof NativeView>>(null);
  useModalFocus(visible, headingRef, returnFocus);
  const cleanup = (file?: PreparedPdf) => {
    if (!file) return;
    try {
      const local = new File(file.uri);
      if (local.exists) local.delete();
    } catch {
      /* best effort, app cache only */
    }
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cleanup(currentFile.current);
    };
  }, []);
  const close = () => {
    if (operation.current) return;
    cleanup(prepared);
    currentFile.current = undefined;
    setPrepared(undefined);
    setPreparedScope(undefined);
    setError("");
    onClose();
  };
  const prepare = async () => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    const frozen = capturePdfSnapshot(snapshot);
    const frozenScope = { ...scope, categories: [...scope.categories] };
    try {
      const file = await prepareVocabularyPdf(frozen);
      if (!mounted.current) {
        cleanup(file);
        return;
      }
      currentFile.current = file;
      setPrepared(file);
      setPreparedScope(frozenScope);
    } catch {
      if (mounted.current) setError(t("Could not create the PDF. Please try again."));
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const share = async () => {
    if (operation.current || !prepared) return;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      if (!new File(prepared.uri).exists) throw new Error("missing file");
      await sharePreparedVocabularyPdf(prepared);
    } catch {
      if (mounted.current)
        setError(t("Could not share this PDF. Please try again or create it again."));
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : "slide"}
      onRequestClose={close}
    >
      <Pressable
        accessible={false}
        importantForAccessibility="no"
        onPress={close}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.48)" }}
      />
      <View
        accessibilityViewIsModal
        style={{
          maxHeight: "90%",
          backgroundColor: theme.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <ScrollView
          style={{ backgroundColor: theme.surface }}
          contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
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
            <Pressable ref={headingRef} accessible accessibilityRole="header" style={{ flex: 1 }}>
              <NotebookText variant="headword" emphasis>
                {t(prepared ? "PDF ready" : "Export PDF")}
              </NotebookText>
            </Pressable>
            <IconButton name="close" label={t("Close")} onPress={close} disabled={busy} />
          </View>
          {prepared ? (
            <>
              <NotebookText>{t("Your PDF is ready to share or save.")}</NotebookText>
              <View
                style={{
                  padding: 16,
                  gap: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.divider,
                  backgroundColor: theme.input,
                }}
              >
                <NotebookText emphasis>{prepared.filename}</NotebookText>
                <NotebookText>
                  {t("termCount", { count: prepared.snapshot.terms.length })}
                </NotebookText>
                <NotebookText>
                  {t("Search")}: {preparedScope?.search || "—"}
                </NotebookText>
                <NotebookText>
                  {t("Categories")}: {preparedScope?.categories.join(", ") || "—"}
                </NotebookText>
                <NotebookText>
                  {t(prepared.snapshot.layout === "compact" ? "Compact view" : "Detailed view")} ·{" "}
                  {preparedScope?.order}
                </NotebookText>
              </View>
              <ActionButton
                label={t("Share or save PDF")}
                busy={busy}
                onPress={() => void share()}
              />
              {!!error && (
                <ActionButton
                  label={t("Create again")}
                  variant="secondary"
                  disabled={busy}
                  onPress={() => {
                    cleanup(prepared);
                    currentFile.current = undefined;
                    setPrepared(undefined);
                    setPreparedScope(undefined);
                    setError("");
                  }}
                />
              )}
              <ActionButton label={t("Done")} variant="secondary" disabled={busy} onPress={close} />
            </>
          ) : (
            <>
              <NotebookText>
                {snapshot.collection.icon} {snapshot.collection.name}
              </NotebookText>
              <NotebookText>{t("termCount", { count: snapshot.terms.length })}</NotebookText>
              <View
                style={{
                  padding: 16,
                  gap: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.divider,
                  backgroundColor: theme.input,
                }}
              >
                <NotebookText emphasis>{t("Active export scope")}</NotebookText>
                <NotebookText>
                  {t("Search")}: {scope.search || "—"}
                </NotebookText>
                <NotebookText>
                  {t("Categories")}: {scope.categories.length ? scope.categories.join(", ") : "—"}
                </NotebookText>
                <NotebookText>
                  {t(snapshot.layout === "compact" ? "Compact view" : "Detailed view")} ·{" "}
                  {scope.order}
                </NotebookText>
              </View>
              <NotebookText>
                {t(
                  snapshot.terms.length
                    ? "The current results will be included in this PDF."
                    : "There are no results to export.",
                )}
              </NotebookText>
              <ActionButton
                label={t("Create PDF")}
                busy={busy}
                disabled={!snapshot.terms.length}
                onPress={() => void prepare()}
              />
              <ActionButton
                label={t("Cancel")}
                variant="secondary"
                disabled={busy}
                onPress={close}
              />
            </>
          )}
          {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
