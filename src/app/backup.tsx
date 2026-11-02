import { useTranslation } from "react-i18next";
import { useLocalSearchParams, usePreventRemove, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { File } from "expo-file-system";
import { ActivityIndicator, Modal, Pressable, type View as NativeView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View, useTheme } from "../ui/theme";
import { NotebookText } from "../ui/typography";
import { ActionButton } from "../ui/action-button";
import { useConfirmation } from "../ui/confirmation-provider";
import { AppBar } from "../ui/layout";
import { IconButton } from "../ui/controls";
import { useModalFocus } from "../ui/use-modal-focus";
import { useReducedMotion } from "../ui/use-reduced-motion";
import { useServices } from "../data/services";
import i18n, { resolveLanguage } from "../i18n";
import { replaceFromBackup, RestoreFailure } from "../platform/backup";
import {
  BackupSelectionError,
  prepareBackup,
  selectBackup,
  sharePreparedBackup,
  type PreparedBackup,
  type SelectedBackup,
} from "../platform/backup-files";

type Stage =
  | "home"
  | "preview"
  | "restoring"
  | "restoreError"
  | "restoreUnknown"
  | "postCommitError"
  | "invalid"
  | "export";
// Opt-in review builds only; never set this environment variable for a distributable build.
const reviewFaults = process.env.EXPO_PUBLIC_NOTEBOOK_REVIEW_FAULTS === "1";
export default function BackupScreen() {
  const { t, i18n: locale } = useTranslation();
  const { db, repository, refresh, setRestoreNotice } = useServices();
  const router = useRouter();
  const confirm = useConfirmation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
  const [stage, setStage] = useState<Stage>("home");
  const [candidate, setCandidate] = useState<SelectedBackup>();
  const [prepared, setPrepared] = useState<PreparedBackup>();
  const [returnTo, setReturnTo] = useState<"home" | "preview">("home");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invalidFile, setInvalidFile] = useState("");
  const operation = useRef(false);
  const allowNavigation = useRef(false);
  const mounted = useRef(true);
  const currentFile = useRef<PreparedBackup | undefined>(undefined);
  const confirmOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const exportOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const exportHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  useModalFocus(stage === "export", exportHeading, exportOpener);
  usePreventRemove(stage === "restoring", ({ repeat }) => {
    if (allowNavigation.current) repeat();
  });
  const cleanup = (file?: PreparedBackup) => {
    if (!file) return;
    try {
      const local = new File(file.uri);
      if (local.exists) local.delete();
    } catch {
      /* best-effort app-cache cleanup */
    }
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cleanup(currentFile.current);
    };
  }, []);
  const counts = (backup: SelectedBackup["backup"]) =>
    [
      t("collectionCount", { count: backup.data.collections.length }),
      t("termCount", { count: backup.data.terms.length }),
      t("categoryCount", { count: backup.data.categories.length }),
      t("filterCount", { count: backup.data.savedFilters.length }),
    ].join(" · ");
  const choose = async () => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    try {
      const selected = await selectBackup();
      if (selected && mounted.current) {
        setError("");
        setCandidate(selected);
        setStage("preview");
      }
    } catch (failure) {
      if (!mounted.current) return;
      setCandidate(undefined);
      if (failure instanceof BackupSelectionError) {
        setInvalidFile(failure.filename);
        setError(
          t(
            failure.reason === "oversized"
              ? "This backup is too large."
              : failure.reason === "read"
                ? "Could not read this backup."
                : failure.reason === "unsupported"
                  ? "This backup format is not supported."
                  : "This backup is invalid.",
          ),
        );
      } else {
        setInvalidFile("");
        setError(t("Could not read this backup."));
      }
      setStage("invalid");
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const createExport = async () => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      const file = await prepareBackup(db);
      if (!mounted.current) {
        cleanup(file);
        return;
      }
      currentFile.current = file;
      setPrepared(file);
      setReturnTo(stage === "preview" ? "preview" : "home");
      setStage("export");
    } catch {
      if (mounted.current) setError(t("Could not prepare the backup. Please try again."));
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const share = async () => {
    if (!prepared || operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      await sharePreparedBackup(prepared);
    } catch {
      if (mounted.current) setError(t("Could not share this backup. Please try again."));
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const doneExport = () => {
    if (operation.current) return;
    cleanup(prepared);
    currentFile.current = undefined;
    setPrepared(undefined);
    setError("");
    setStage(returnTo);
  };
  const restore = () => {
    if (!candidate || operation.current) return;
    operation.current = true;
    setError("");
    setStage("restoring");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        try {
          replaceFromBackup(db, candidate.backup);
        } catch (failure) {
          operation.current = false;
          if (mounted.current)
            setStage(
              failure instanceof RestoreFailure && failure.outcome === "unchanged"
                ? "restoreError"
                : "restoreUnknown",
            );
          return;
        }
        void (async () => {
          try {
            if (fromOnboarding === "1") repository.updatePreferences({ onboardingComplete: true });
            await i18n.changeLanguage(resolveLanguage(repository.getPreferences().locale));
            refresh();
            setRestoreNotice(true);
            allowNavigation.current = true;
            router.dismissAll();
            router.replace("/");
          } catch {
            if (mounted.current) setStage("postCommitError");
          } finally {
            operation.current = false;
          }
        })();
      }),
    );
  };
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 12 }}>
        <AppBar
          title={t(
            stage === "preview" || (stage === "export" && returnTo === "preview")
              ? "Restore preview"
              : "Backups",
          )}
          backLabel={t("Back")}
          onBack={stage === "restoring" ? undefined : () => router.back()}
        />
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: Math.max(insets.bottom, 24),
          gap: 16,
          flexGrow: 1,
        }}
      >
        {stage === "home" || (stage === "export" && returnTo === "home") ? (
          <>
            <NotebookText variant="pageTitle" emphasis>
              {t("Keep a copy of your words.")}
            </NotebookText>
            <NotebookText>
              {t("Your notebook stays on this device. Keep a backup somewhere safe.")}
            </NotebookText>
            <View
              style={{
                padding: 20,
                gap: 12,
                borderWidth: 1,
                borderColor: theme.divider,
                borderRadius: 20,
                backgroundColor: theme.surface,
              }}
            >
              <NotebookText variant="headword" emphasis>
                {t("Export backup")}
              </NotebookText>
              <NotebookText variant="secondary">
                {t("Create a JSON backup of your notebook.")}
              </NotebookText>
              <ActionButton
                ref={exportOpener}
                label={t("Export current data")}
                busy={busy}
                onPress={() => void createExport()}
              />
            </View>
            <View
              style={{
                padding: 20,
                gap: 12,
                borderWidth: 1,
                borderColor: theme.divider,
                borderRadius: 20,
                backgroundColor: theme.surface,
              }}
            >
              <NotebookText variant="headword" emphasis>
                {t("Restore from a file")}
              </NotebookText>
              <NotebookText variant="secondary">
                {t("Choose a Vocabulaire backup from this device.")}
              </NotebookText>
              <ActionButton
                label={t("Choose backup to restore")}
                variant="secondary"
                disabled={busy}
                onPress={() => void choose()}
              />
            </View>
            <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
              {t("Backups from the old Ionic app cannot be imported.")}
            </NotebookText>
          </>
        ) : stage === "invalid" ? (
          <>
            <NotebookText variant="pageTitle" emphasis>
              {t("Cannot use this backup")}
            </NotebookText>
            <View
              style={{ padding: 20, gap: 8, borderRadius: 16, backgroundColor: theme.errorSurface }}
            >
              {invalidFile ? <NotebookText emphasis>{invalidFile}</NotebookText> : null}
              {error ? (
                <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
                  {error}
                </Text>
              ) : null}
            </View>
            <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
              {t("No notebook data was changed.")}
            </NotebookText>
            <ActionButton
              label={t("Choose another file")}
              busy={busy}
              onPress={() => void choose()}
            />
            <ActionButton
              label={t("Cancel restore")}
              variant="secondary"
              disabled={busy}
              onPress={() => {
                setError("");
                setStage("home");
              }}
            />
          </>
        ) : (stage === "preview" || (stage === "export" && returnTo === "preview")) && candidate ? (
          <>
            <View
              style={{
                padding: 20,
                gap: 8,
                borderWidth: 1,
                borderColor: theme.divider,
                borderRadius: 20,
                backgroundColor: theme.surface,
              }}
            >
              <NotebookText variant="section" emphasis>
                {candidate.filename}
              </NotebookText>
              <NotebookText variant="secondary">
                {new Intl.DateTimeFormat(locale.resolvedLanguage || "en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(candidate.backup.exportedAt))}
              </NotebookText>
            </View>
            <NotebookText variant="headword" emphasis>
              {t("Notebook content")}
            </NotebookText>
            <View
              style={{
                padding: 20,
                borderWidth: 1,
                borderColor: theme.divider,
                borderRadius: 20,
                backgroundColor: theme.surface,
              }}
            >
              <NotebookText>{counts(candidate.backup)}</NotebookText>
            </View>
            <View style={{ padding: 20, borderRadius: 16, backgroundColor: theme.errorSurface }}>
              <NotebookText>{t("restoreHint")}</NotebookText>
            </View>
            {reviewFaults && (
              <>
                <ActionButton
                  label="Review restoring state"
                  onPress={() => setStage("restoring")}
                />
                <ActionButton
                  label="Review rollback state"
                  onPress={() => setStage("restoreError")}
                />
              </>
            )}
            <ActionButton
              ref={confirmOpener}
              label={t("Continue to confirmation")}
              disabled={busy}
              onPress={() =>
                confirm({
                  title: t("Replace all current data?"),
                  message: `${candidate.filename}\n\n${t("restoreWarning")}`,
                  cancel: t("Cancel"),
                  confirm: t("Replace all data"),
                  destructive: true,
                  onConfirm: restore,
                  returnFocus: confirmOpener,
                })
              }
            />
            <ActionButton
              ref={exportOpener}
              label={t("Export current data first")}
              variant="secondary"
              busy={busy}
              onPress={() => void createExport()}
            />
            <ActionButton
              label={t("Choose another file")}
              variant="secondary"
              disabled={busy}
              onPress={() => void choose()}
            />
            <ActionButton
              label={t("Cancel restore")}
              variant="secondary"
              disabled={busy}
              onPress={() => {
                setCandidate(undefined);
                setStage("home");
              }}
            />
          </>
        ) : stage === "restoring" ? (
          <View style={{ flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
            {!reducedMotion && <ActivityIndicator size="large" color={theme.primary} />}
            <NotebookText
              variant="headword"
              emphasis
              accessibilityLiveRegion="polite"
              style={{ textAlign: "center" }}
            >
              {t("Restoring backup…")}
            </NotebookText>
            <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
              {t("Keep Vocabulaire open while your data is restored.")}
            </NotebookText>
            {candidate && <NotebookText variant="secondary">{candidate.filename}</NotebookText>}
          </View>
        ) : stage === "restoreError" ? (
          <>
            <View style={{ padding: 20, borderRadius: 16, backgroundColor: theme.errorSurface }}>
              <Text accessibilityRole="alert" style={{ color: theme.destructive }}>
                {t("Restore failed. Your previous data was kept.")}
              </Text>
            </View>
            {candidate && (
              <View
                style={{
                  padding: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.divider,
                  backgroundColor: theme.surface,
                  gap: 8,
                }}
              >
                <NotebookText emphasis>{candidate.filename}</NotebookText>
                <NotebookText variant="secondary">{counts(candidate.backup)}</NotebookText>
              </View>
            )}
            <ActionButton label={t("Retry")} onPress={restore} />
            <ActionButton
              label={t("Choose another file")}
              variant="secondary"
              onPress={() => void choose()}
            />
            <ActionButton
              label={t("Cancel restore")}
              variant="secondary"
              onPress={() => {
                setCandidate(undefined);
                setStage("home");
              }}
            />
          </>
        ) : stage === "restoreUnknown" ? (
          <>
            <Text accessibilityRole="alert">
              {t("Restore outcome could not be confirmed. Restart the app before trying again.")}
            </Text>
            <ActionButton
              label={t("Cancel restore")}
              variant="secondary"
              onPress={() => {
                setCandidate(undefined);
                setStage("home");
              }}
            />
          </>
        ) : stage === "postCommitError" ? (
          <Text accessibilityRole="alert">
            {t("Data was restored, but the screen could not refresh. Restart the app.")}
          </Text>
        ) : null}
        {error && stage !== "invalid" && stage !== "export" ? (
          <Text accessibilityRole="alert">{error}</Text>
        ) : null}
      </ScrollView>
      <Modal
        visible={stage === "export" && !!prepared}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={doneExport}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.48)" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Close")}
            disabled={busy}
            onPress={doneExport}
            style={{ flex: 1 }}
          />
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: "90%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              backgroundColor: theme.surface,
              padding: 24,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <ScrollView
              style={{ backgroundColor: theme.surface }}
              contentContainerStyle={{ gap: 16 }}
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
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.surface,
                }}
              >
                <Pressable
                  ref={exportHeading}
                  accessible
                  accessibilityRole="header"
                  style={{ flex: 1 }}
                >
                  <NotebookText variant="headword" emphasis>
                    {t("Backup ready")}
                  </NotebookText>
                </Pressable>
                <IconButton name="close" label={t("Close")} disabled={busy} onPress={doneExport} />
              </View>
              <NotebookText>{t("Choose where to share or save this file.")}</NotebookText>
              {prepared && (
                <View
                  style={{
                    padding: 20,
                    gap: 8,
                    borderWidth: 1,
                    borderColor: theme.divider,
                    borderRadius: 16,
                    backgroundColor: theme.input,
                  }}
                >
                  <NotebookText emphasis>{prepared.filename}</NotebookText>
                  <NotebookText variant="secondary">{counts(prepared.snapshot)}</NotebookText>
                </View>
              )}
              {error ? <Text accessibilityRole="alert">{error}</Text> : null}
              <ActionButton
                label={t("Share or save backup")}
                busy={busy}
                onPress={() => void share()}
              />
              <ActionButton
                label={t("Done")}
                variant="secondary"
                disabled={busy}
                onPress={doneExport}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
