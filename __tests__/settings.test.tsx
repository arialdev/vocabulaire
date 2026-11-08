import { fireEvent, render, screen } from "@testing-library/react-native";
import SettingsScreen from "../src/app/settings";
import i18n from "../src/i18n";

let mockPrefs = { locale: "en", appearance: "light" };
const mockUpdate = jest.fn((value) => {
  mockPrefs = { ...mockPrefs, ...value };
});
const mockRepo = { getPreferences: () => mockPrefs, updatePreferences: mockUpdate };
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepo, revision: 0, refresh: jest.fn() }),
}));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
afterEach(async () => {
  mockPrefs = { locale: "en", appearance: "light" };
  jest.clearAllMocks();
  await i18n.changeLanguage("en");
});

test("immediately saves the chosen language and appearance with selected radio states", async () => {
  const view = await render(<SettingsScreen />);
  await fireEvent.press(screen.getByRole("radio", { name: "Dark" }));
  expect(mockUpdate).toHaveBeenLastCalledWith({ appearance: "dark" });
  await view.rerender(<SettingsScreen />);
  expect(screen.getByRole("radio", { name: "Dark" }).props.accessibilityState.checked).toBe(true);
  await fireEvent.press(screen.getByRole("radio", { name: "Español" }));
  expect(mockUpdate).toHaveBeenLastCalledWith({ locale: "es" });
});

test("reports a failed preference write without selecting it", async () => {
  mockUpdate.mockImplementationOnce(() => {
    throw new Error("storage failed");
  });
  await render(<SettingsScreen />);
  await fireEvent.press(screen.getByRole("radio", { name: "Dark" }));
  expect(screen.getByText("Could not save your settings. Please try again.")).toBeTruthy();
  expect(screen.getByRole("radio", { name: "Light" }).props.accessibilityState.checked).toBe(true);
});
