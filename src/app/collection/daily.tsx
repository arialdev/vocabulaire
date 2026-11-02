import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "../../ui/theme";
import { useServices } from "../../data/services";
import type { Term } from "../../data/schema";
import { localDate } from "../../domain/daily-word";

type Result =
  | { status: "loading" | "error" | "missing" | "insufficient" }
  | { status: "ready"; term: Term };
export default function DailyScreen() {
  const { t } = useTranslation();
  const { collectionId: param } = useLocalSearchParams<{ collectionId: string }>();
  const collectionId = Number(param);
  const { repository, revision } = useServices();
  const [result, setResult] = useState<Result>({ status: "loading" });
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (!repository.listCollections().some((item) => item.id === collectionId))
          return { status: "missing" } as const;
        const term = repository.dailyWord(collectionId, localDate(new Date()));
        return term ? ({ status: "ready", term } as const) : ({ status: "insufficient" } as const);
      })
      .then(
        (value) => {
          if (active) setResult(value);
        },
        () => {
          if (active) setResult({ status: "error" });
        },
      );
    return () => {
      active = false;
    };
  }, [collectionId, repository, revision]);
  if (result.status === "error")
    return <Text accessibilityRole="alert">{t("Could not load the daily word.")}</Text>;
  if (result.status === "missing") return <Text>{t("Collection not found.")}</Text>;
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{t("Word of the day")}</Text>
      {result.status === "loading" ? (
        <Text>{t("Loading…")}</Text>
      ) : result.status === "insufficient" ? (
        <Text>{t("Add at least five terms to see a daily word.")}</Text>
      ) : result.status === "ready" ? (
        <>
          <Text style={{ fontSize: 22 }}>{result.term.original}</Text>
          <Text style={{ fontSize: 18 }}>{result.term.translation}</Text>
          {result.term.notes ? <Text>{result.term.notes}</Text> : null}
        </>
      ) : null}
    </ScrollView>
  );
}
