import { Stack } from "expo-router";
import { ServicesProvider } from "../data/services";
import { useTheme } from "../ui/theme";

function Navigation() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerTitle: "Vocabulaire",
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.foreground,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
export default function RootLayout() {
  return (
    <ServicesProvider>
      <Navigation />
    </ServicesProvider>
  );
}
