import { cleanPronunciationCache } from "../platform/pronunciation-cache";
import { useTranslation } from "react-i18next";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { initializeDatabase, type Database } from "./database";
import { createRepository, type Repository } from "./repository";
import i18n, { resolveLanguage } from "../i18n";
import { ThemeProvider, Text, View } from "../ui/theme";
import { FontsProvider } from "../ui/typography";
import { loadNotebookFonts } from "../ui/fonts";

void SplashScreen.preventAutoHideAsync().catch(() => {});
cleanPronunciationCache();

type Services = {
  db: Database;
  repository: Repository;
  revision: number;
  refresh: () => void;
  restoreNotice: boolean;
  setRestoreNotice: (visible: boolean) => void;
};
const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [attempt, setAttempt] = useState(0);
  const [fontAttempt, setFontAttempt] = useState(0);
  const [repository, setRepository] = useState<Repository>();
  const [db, setDb] = useState<Database>();
  const [error, setError] = useState(false);
  const [fonts, setFonts] = useState<"loading" | "ready" | "error" | "fallback">("loading");
  const [revision, setRevision] = useState(0);
  const [restoreNotice, setRestoreNotice] = useState(false);
  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then(async (database) => {
        const next = createRepository(database);
        await i18n.changeLanguage(resolveLanguage(next.getPreferences().locale));
        if (active) {
          setDb(database);
          setRepository(next);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    let active = true;
    loadNotebookFonts().then(
      () => {
        if (active) setFonts("ready");
      },
      () => {
        if (active) setFonts("error");
      },
    );
    return () => {
      active = false;
    };
  }, [fontAttempt]);
  const showRecovery = error || fonts === "error";
  const ready = Boolean(repository && db && (fonts === "ready" || fonts === "fallback"));
  useEffect(() => {
    if (showRecovery || ready) void SplashScreen.hideAsync().catch(() => {});
  }, [showRecovery, ready]);
  if (!ready || !repository || !db) {
    if (!showRecovery) return null;
    return (
      <ThemeProvider appearance={repository?.getPreferences().appearance ?? "system"}>
        <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
          {error ? (
            <>
              <Text accessibilityRole="alert">
                {t("Could not open your database. Your data has not been deleted.")}
              </Text>
              <Button
                title={t("Retry")}
                onPress={() => {
                  setError(false);
                  setAttempt((value) => value + 1);
                }}
              />
            </>
          ) : (
            <>
              <Text accessibilityRole="alert">
                {t("Could not load notebook fonts. You can retry or use system fonts.")}
              </Text>
              <Button
                title={t("Retry")}
                onPress={() => {
                  setFonts("loading");
                  setFontAttempt((value) => value + 1);
                }}
              />
              <Button title={t("Use system fonts")} onPress={() => setFonts("fallback")} />
            </>
          )}
        </View>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider appearance={repository.getPreferences().appearance}>
      <FontsProvider ready={fonts === "ready"}>
        <ServicesContext.Provider
          value={{
            db,
            repository,
            revision,
            refresh: () => setRevision((value) => value + 1),
            restoreNotice,
            setRestoreNotice,
          }}
        >
          {children}
        </ServicesContext.Provider>
      </FontsProvider>
    </ThemeProvider>
  );
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error("Services are not ready");
  return services;
}
