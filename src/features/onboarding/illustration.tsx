import { useTranslation } from "react-i18next";
import { Text, View, useTheme } from "../../ui/theme";
import { NotebookText, Icon } from "../../ui/typography";

/** Decorative examples use only the fields supported by the notebook. */
export function OnboardingIllustration({ step }: { step: number }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const card = {
    width: "100%" as const,
    maxWidth: 320,
    minHeight: 185,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.divider,
    backgroundColor: theme.surface,
    padding: 20,
    gap: 12,
  };
  if (step === 0 || step === 1)
    return (
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{
          ...card,
          borderLeftWidth: 12,
          borderLeftColor: step === 0 ? theme.primary : theme.divider,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "transparent",
            gap: 8,
          }}
        >
          <Text>☕</Text>
          <NotebookText variant="secondary" style={{ flex: 1, color: theme.secondaryText }}>
            {t("exampleCollection")}
          </NotebookText>
          {step === 1 && (
            <NotebookText variant="secondary" style={{ color: theme.grammaticalText }}>
              {t("exampleVerb")}
            </NotebookText>
          )}
        </View>
        <View style={{ height: 1, backgroundColor: theme.divider }} />
        <NotebookText variant="headword">flâner</NotebookText>
        <NotebookText>to wander without hurry</NotebookText>
        {step === 1 && (
          <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
            On a quiet Sunday, with no destination in mind.
          </NotebookText>
        )}
        <NotebookText variant="secondary" style={{ color: theme.thematicText }}>
          ♧ {t("exampleEveryday")}
        </NotebookText>
      </View>
    );
  if (step === 2)
    return (
      <View accessible={false} importantForAccessibility="no-hide-descendants" style={card}>
        <View
          style={{
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.input,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            gap: 8,
          }}
        >
          <Icon name="search" />
          <View
            style={{ width: 100, height: 8, borderRadius: 4, backgroundColor: theme.divider }}
          />
        </View>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, backgroundColor: "transparent" }}
        >
          <NotebookText
            style={{
              color: theme.grammaticalText,
              backgroundColor: theme.grammaticalFill,
              padding: 8,
              borderRadius: 12,
            }}
          >
            Aa {t("exampleVerb")}
          </NotebookText>
          <NotebookText
            style={{
              color: theme.thematicText,
              backgroundColor: theme.thematicFill,
              padding: 8,
              borderRadius: 12,
            }}
          >
            ♧ {t("exampleTravel")}
          </NotebookText>
          <NotebookText style={{ color: theme.secondaryText, padding: 8 }}>A–Z</NotebookText>
        </View>
        <View style={{ height: 1, backgroundColor: theme.divider }} />
        <View
          style={{ width: "70%", height: 8, borderRadius: 4, backgroundColor: theme.divider }}
        />
      </View>
    );
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        ...card,
        minHeight: 185,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.input,
      }}
    >
      <View
        style={{
          width: 150,
          height: 150,
          borderRadius: 16,
          backgroundColor: theme.primary,
          padding: 18,
          justifyContent: "space-between",
        }}
      >
        <NotebookText variant="secondary" emphasis style={{ color: theme.onPrimary }}>
          VOCABULAIRE
        </NotebookText>
        <View
          style={{
            alignSelf: "flex-end",
            borderRadius: 30,
            padding: 10,
            backgroundColor: theme.selected,
          }}
        >
          <Icon name="check" color={theme.primary} />
        </View>
      </View>
    </View>
  );
}
