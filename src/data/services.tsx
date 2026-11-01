import { useTranslation } from "react-i18next";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button, Text, View } from "react-native";
import { initializeDatabase, type Database } from "./database";
import { createRepository, type Repository } from "./repository";
import i18n, { resolveLanguage } from "../i18n";
import { ThemeProvider } from "../ui/theme";

type Services = {
  db: Database;
  repository: Repository;
  revision: number;
  refresh: () => void;
};
const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [attempt, setAttempt] = useState(0);
  const [repository, setRepository] = useState<Repository>();
  const [db, setDb] = useState<Database>();
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then((db) => {
        if (active) {
          const next = createRepository(db);
          void i18n.changeLanguage(resolveLanguage(next.getPreferences().locale));
          setDb(db);
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
  if (!repository || !db)
    return (
      <View>
        <Text>
          {error
            ? t("Could not open your database. Your data has not been deleted.")
            : t("Opening database…")}
        </Text>
        {error && (
          <Button
            title={t("Retry")}
            onPress={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          />
        )}
      </View>
    );
  return (
    <ThemeProvider appearance={repository.getPreferences().appearance}>
      <ServicesContext.Provider
        value={{ db, repository, revision, refresh: () => setRevision((value) => value + 1) }}
      >
        {children}
      </ServicesContext.Provider>
    </ThemeProvider>
  );
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error("Services are not ready");
  return services;
}
