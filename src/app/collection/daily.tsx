import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, useTheme } from "../../ui/theme";
import { Icon, NotebookText } from "../../ui/typography";
import { ActionButton } from "../../ui/action-button";
import { AppBar, ScreenLayout } from "../../ui/layout";
import { useServices } from "../../data/services";
import type { Category, Term } from "../../data/schema";
import { localDate } from "../../domain/daily-word";

type Result =
  | { status: "loading" | "error" | "missing" }
  | { status: "insufficient"; missing: number }
  | { status: "ready"; term: Term; categories: Category[] };
export default function DailyScreen() {
  const { t, i18n } = useTranslation();
  const { collectionId: param } = useLocalSearchParams<{ collectionId: string }>();
  const collectionId = Number(param);
  const router = useRouter();
  const theme = useTheme();
  const { repository, revision } = useServices();
  const [today] = useState(() => new Date());
  const [result, setResult] = useState<Result>({ status: "loading" });
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (!repository.listCollections().some((item) => item.id === collectionId))
          return { status: "missing" } as const;
        const all = repository.listTerms(collectionId);
        if (all.length < 5) return { status: "insufficient", missing: 5 - all.length } as const;
        const term = repository.dailyWord(collectionId, localDate(today));
        if (!term) throw new Error("Daily word unavailable");
        const selected = all.find((item) => item.id === term.id)?.categoryIds ?? [];
        return {
          status: "ready",
          term,
          categories: repository
            .listCategories(collectionId)
            .filter((category) => selected.includes(category.id)),
        } as const;
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
  }, [collectionId, repository, revision, today]);
  if (result.status === "error")
    return <Text accessibilityRole="alert">{t("Could not load the daily word.")}</Text>;
  if (result.status === "missing") return <Text>{t("Collection not found.")}</Text>;
  return (
    <ScreenLayout
      footer={
        result.status === "insufficient" ? (
          <ActionButton
            label={t("addMoreTerms", { count: result.missing })}
            onPress={() => router.push({ pathname: "/term/edit", params: { collectionId } })}
          />
        ) : result.status === "ready" ? (
          <ActionButton
            label={t("Open term")}
            onPress={() =>
              router.push({ pathname: "/term/[id]", params: { id: result.term.id, collectionId } })
            }
          />
        ) : null
      }
    >
      <AppBar title={t("Word of the day")} backLabel={t("Back")} onBack={() => router.back()} />
      {result.status === "loading" ? (
        <Text>{t("Loading…")}</Text>
      ) : result.status === "insufficient" ? (
        <View style={{ flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 1,
              borderColor: theme.divider,
              backgroundColor: theme.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="daily" size={56} color={theme.primary} />
          </View>
          <NotebookText variant="headword" emphasis style={{ textAlign: "center" }}>
            {t("A few more words to begin.")}
          </NotebookText>
          <NotebookText style={{ textAlign: "center" }}>
            {t("Add at least five terms to see a daily word.")}
          </NotebookText>
        </View>
      ) : result.status === "ready" ? (
        <>
          <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
            {new Intl.DateTimeFormat(i18n.resolvedLanguage || "en", {
              day: "numeric",
              month: "long",
            }).format(today)}
          </NotebookText>
          <NotebookText variant="secondary">
            {t("A word from your notebook, each day.")}
          </NotebookText>
          <View
            style={{
              gap: 16,
              padding: 24,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: theme.divider,
              backgroundColor: theme.surface,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                backgroundColor: "transparent",
              }}
            >
              {result.categories.map((category) => (
                <View
                  key={category.id}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor:
                      category.kind === "grammatical" ? theme.grammaticalFill : theme.thematicFill,
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
                    {t(category.kind === "grammatical" ? "Grammatical" : "Thematic")}:{" "}
                    {category.name}
                  </NotebookText>
                </View>
              ))}
            </View>
            <NotebookText variant="display">{result.term.original}</NotebookText>
            <NotebookText variant="secondary">{t("Meaning")}</NotebookText>
            <NotebookText variant="section">{result.term.translation}</NotebookText>
            {result.term.notes ? (
              <View
                style={{ padding: 16, borderRadius: 12, backgroundColor: theme.canvas, gap: 8 }}
              >
                <NotebookText variant="secondary">{t("Notebook note")}</NotebookText>
                <NotebookText>{result.term.notes}</NotebookText>
              </View>
            ) : null}
          </View>
          <NotebookText
            variant="secondary"
            style={{ textAlign: "center", color: theme.secondaryText }}
          >
            {t("A new term appears tomorrow.")}
          </NotebookText>
        </>
      ) : null}
    </ScreenLayout>
  );
}
