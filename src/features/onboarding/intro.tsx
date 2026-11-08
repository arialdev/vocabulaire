import { useModalFocus } from "../../ui/use-modal-focus";
import { useReducedMotion } from "../../ui/use-reduced-motion";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, PanResponder, Pressable, View as NativeView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useServices } from "../../data/services";
import { ScrollView, Text, View, useTheme } from "../../ui/theme";
import { NotebookText } from "../../ui/typography";
import { ActionButton } from "../../ui/action-button";
import { IconButton } from "../../ui/controls";
import { introSwipeDelta, nextIntroStep } from "./transitions";
import { OnboardingIllustration } from "./illustration";

export function Intro() {
  const { repository, refresh } = useServices();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [choices, setChoices] = useState(false);
  const choicesOpener = useRef<React.ElementRef<typeof NativeView>>(null);
  const choicesHeading = useRef<React.ElementRef<typeof NativeView>>(null);
  useModalFocus(choices, choicesHeading, choicesOpener);
  const [error, setError] = useState(false);
  const step = Math.max(0, Math.min(repository.getPreferences().onboardingStep, 3));
  const previousStep = useRef(step);
  const hasAnimated = useRef(false);
  const [opacity] = useState(() => new Animated.Value(1));
  const [offset] = useState(() => new Animated.Value(0));
  useLayoutEffect(() => {
    const direction = step < previousStep.current ? -1 : 1;
    const changed = step !== previousStep.current;
    previousStep.current = step;
    if (reducedMotion) {
      opacity.setValue(1);
      offset.setValue(0);
      return;
    }
    if (!changed && hasAnimated.current) {
      opacity.setValue(1);
      offset.setValue(0);
      return;
    }
    hasAnimated.current = true;
    opacity.setValue(changed ? 0.8 : 0.95);
    offset.setValue(direction * (changed ? 24 : 10));
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [step, reducedMotion, opacity, offset]);
  const pages = [
    { title: t("introWelcome"), body: t("introCollections"), symbol: "📚" },
    { title: t("introTermsTitle"), body: t("introTerms"), symbol: "✎" },
    { title: t("introFiltersTitle"), body: t("introFilters"), symbol: "⌕" },
    { title: t("introBackupTitle"), body: t("introBackup"), symbol: "▤" },
  ];
  const transition = (delta: number) => {
    const next = nextIntroStep(step, delta);
    if (next === step) return;
    try {
      repository.updatePreferences({ onboardingStep: next });
      setError(false);
      refresh();
    } catch {
      setError(true);
    }
  };
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (event, gesture) =>
      event.nativeEvent.pageX - gesture.dx > 24 &&
      Math.abs(gesture.dx) > 18 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderRelease: (_, gesture) => {
      transition(introSwipeDelta(gesture.dx, gesture.dy, gesture.x0));
    },
  });
  const complete = () => {
    try {
      repository.updatePreferences({ onboardingComplete: true, onboardingStep: step });
      setError(false);
      refresh();
      return true;
    } catch {
      setError(true);
      return false;
    }
  };
  const create = () => {
    setChoices(false);
    if (complete()) router.push("/collection/edit");
  };
  const restore = () => {
    setChoices(false);
    router.push({ pathname: "/backup", params: { fromOnboarding: "1" } });
  };
  const skip = () => {
    setChoices(false);
    complete();
  };
  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          minHeight: 56,
          paddingHorizontal: 24,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <NotebookText variant="pageTitle" emphasis>
          Vocabulaire
        </NotebookText>
        <Pressable accessibilityRole="button" onPress={skip} style={{ padding: 12 }}>
          <Text>{t("Skip")}</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 16, gap: 16 }}
      >
        <Animated.View
          {...pan.panHandlers}
          style={{
            flexGrow: 1,
            minHeight: 280,
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            opacity,
            transform: [{ translateX: offset }],
          }}
        >
          <OnboardingIllustration step={step} />
          <NotebookText
            variant="pageTitle"
            emphasis
            style={{ textAlign: "center", lineHeight: 42, paddingBottom: 4 }}
          >
            {pages[step].title}
          </NotebookText>
          <NotebookText style={{ textAlign: "center", color: theme.secondaryText }}>
            {pages[step].body}
          </NotebookText>
          {step === 3 && (
            <View
              style={{
                alignSelf: "stretch",
                backgroundColor: theme.surface,
                borderColor: theme.divider,
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
                gap: 4,
              }}
            >
              <NotebookText emphasis>{t("introPrivacyTitle")}</NotebookText>
              <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
                {t("introPrivacyBody")}
              </NotebookText>
            </View>
          )}
        </Animated.View>
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <NotebookText variant="secondary">
            {t("introProgress", { current: step + 1, total: 4 })}
          </NotebookText>
          <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={{ flexDirection: "row", gap: 8 }}
          >
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={{
                  width: index === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === step ? theme.primary : theme.divider,
                }}
              />
            ))}
          </View>
        </View>
        {error && (
          <Text accessibilityRole="alert">
            {t("Could not save your progress. Please try again.")}
          </Text>
        )}
        {step < 3 ? (
          <>
            <NotebookText
              variant="secondary"
              style={{ textAlign: "center", color: theme.secondaryText }}
            >
              {t("← Swipe left to continue")}
            </NotebookText>
            {step > 0 ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ActionButton
                    label={t("introBack")}
                    variant="secondary"
                    onPress={() => transition(-1)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ActionButton label={t("introNext")} onPress={() => transition(1)} />
                </View>
              </View>
            ) : (
              <ActionButton label={t("introNext")} onPress={() => transition(1)} />
            )}
            <ActionButton
              ref={choicesOpener}
              label={t("introStart")}
              variant="secondary"
              onPress={() => setChoices(true)}
            />
          </>
        ) : (
          <>
            <ActionButton label={t("introCreate")} onPress={create} />
            <ActionButton label={t("introRestore")} variant="secondary" onPress={restore} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <ActionButton
                  label={t("introBack")}
                  variant="secondary"
                  onPress={() => transition(-1)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionButton label={t("Skip for now")} variant="secondary" onPress={skip} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <Modal
        visible={choices}
        transparent
        animationType={reducedMotion ? "none" : "slide"}
        onRequestClose={() => setChoices(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Cancel")}
          onPress={() => setChoices(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.48)" }}
        />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: Math.max(insets.bottom, 24),
            maxHeight: "90%",
          }}
        >
          <ScrollView
            style={{ backgroundColor: theme.surface }}
            contentContainerStyle={{ gap: 12 }}
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
                justifyContent: "space-between",
                backgroundColor: theme.surface,
              }}
            >
              <Pressable
                ref={choicesHeading}
                accessible
                accessibilityRole="header"
                style={{ flex: 1 }}
              >
                <NotebookText variant="pageTitle" emphasis>
                  {t("introChoicesTitle")}
                </NotebookText>
              </Pressable>
              <IconButton name="close" label={t("Close")} onPress={() => setChoices(false)} />
            </View>
            <NotebookText style={{ color: theme.secondaryText }}>
              {t("introChoicesBody")}
            </NotebookText>
            <View style={{ backgroundColor: theme.input, borderRadius: 12, padding: 16 }}>
              <NotebookText variant="secondary" style={{ color: theme.secondaryText }}>
                {t("introPrivacyBody")}
              </NotebookText>
            </View>
            <ActionButton label={t("introCreate")} onPress={create} />
            <ActionButton label={t("introRestore")} variant="secondary" onPress={restore} />
            <ActionButton label={t("introSkip")} variant="secondary" onPress={skip} />
            <ActionButton
              label={t("Cancel")}
              variant="secondary"
              onPress={() => setChoices(false)}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
