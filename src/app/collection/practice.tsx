import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useServices } from "../../data/services";
import type { Repository } from "../../data/repository";
import { chooseFlashcard } from "../../domain/flashcard";
import { ActionButton } from "../../ui/action-button";
import { EmptyState } from "../../ui/controls";
import { AppBar, ScreenLayout } from "../../ui/layout";
import { Text, useTheme } from "../../ui/theme";
import { NotebookText } from "../../ui/typography";

type Terms = ReturnType<Repository["listTerms"]>;
type Load = { status: "loading" | "error" | "missing" } | { status: "ready"; terms: Terms };
type Card = { id?: number; revealed: boolean };

export default function PracticeScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  return <PracticeContents key={collectionId} collectionId={Number(collectionId)} />;
}

function PracticeContents({ collectionId }: { collectionId: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { repository, revision } = useServices();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [card, setCard] = useState<Card>({ revealed: false });

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => {
        if (!repository.listCollections().some((item) => item.id === collectionId)) {
          if (active) setLoad({ status: "missing" });
          return;
        }
        const terms = repository.listTerms(collectionId);
        if (!active) return;
        setCard((previous) => {
          if (terms.some((term) => term.id === previous.id)) return previous;
          return { id: chooseFlashcard(terms.map((term) => term.id)), revealed: false };
        });
        setLoad({ status: "ready", terms });
      })
      .catch(() => {
        if (active) setLoad({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [collectionId, repository, revision, attempt]);

  const terms = load.status === "ready" ? load.terms : [];
  const current = terms.find((term) => term.id === card.id);
  const action = card.revealed ? t("Hide translation") : t("Show translation");
  return (
    <ScreenLayout
      footer={
        current ? (
          <ActionButton
            label={t("Next card")}
            disabled={terms.length < 2}
            onPress={() => {
              setCard({
                id: chooseFlashcard(
                  terms.map((term) => term.id),
                  current.id,
                ),
                revealed: false,
              });
            }}
          />
        ) : undefined
      }
    >
      <AppBar title={t("Flashcard practice")} backLabel={t("Back")} onBack={() => router.back()} />
      {load.status === "loading" && <Text>{t("Loading…")}</Text>}
      {load.status === "missing" && <Text>{t("Collection not found.")}</Text>}
      {load.status === "error" && (
        <>
          <Text accessibilityRole="alert">{t("Could not load vocabulary.")}</Text>
          <ActionButton
            label={t("Retry")}
            variant="secondary"
            onPress={() => setAttempt((value) => value + 1)}
          />
        </>
      )}
      {load.status === "ready" && !terms.length && (
        <EmptyState
          title={t("A new word is a good beginning.")}
          message={t("Add an expression and its translation. The rest can come later.")}
        />
      )}
      {current && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={[
            current.original,
            card.revealed ? current.translation : undefined,
            action,
          ]
            .filter(Boolean)
            .join(", ")}
          onPress={() => setCard((value) => ({ ...value, revealed: !value.revealed }))}
          style={{
            minHeight: 160,
            padding: 24,
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.controlOutline,
            backgroundColor: theme.surface,
            justifyContent: "center",
          }}
        >
          <NotebookText variant="display">{current.original}</NotebookText>
          {card.revealed && <NotebookText variant="section">{current.translation}</NotebookText>}
          <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
            {action}
          </NotebookText>
        </Pressable>
      )}
    </ScreenLayout>
  );
}
