import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { ServicesProvider } from "../data/services";
import { useTheme } from "../ui/theme";
import { ConfirmationProvider } from "../ui/confirmation-provider";

function Navigation() {
  const theme = useTheme();
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.canvas).catch(() => {});
  }, [theme.canvas]);
  return (
    <>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerTitle: "Vocabulaire",
          headerStyle: { backgroundColor: theme.canvas },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.canvas },
        }}
      >
        <Stack.Screen name="collection/edit" options={{ headerShown: false }} />
        <Stack.Screen name="term/edit" options={{ headerShown: false }} />
        <Stack.Screen name="term/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="collection/categories" options={{ headerShown: false }} />
        <Stack.Screen name="collection/daily" options={{ headerShown: false }} />
        <Stack.Screen name="backup" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <ServicesProvider>
      <ConfirmationProvider>
        <Navigation />
      </ConfirmationProvider>
    </ServicesProvider>
  );
}
