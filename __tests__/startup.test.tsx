import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { ServicesProvider } from "../src/data/services";
import "../src/i18n";

const mockLoadFonts = jest.fn();
const mockInitialize = jest.fn();
const mockRepository = { getPreferences: () => ({ locale: "en", appearance: "dark" }) };
jest.mock("../src/ui/fonts", () => ({ loadNotebookFonts: () => mockLoadFonts() }));
jest.mock("../src/data/database", () => ({ initializeDatabase: () => mockInitialize() }));
jest.mock("../src/data/repository", () => ({ createRepository: () => mockRepository }));
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

afterEach(() => jest.clearAllMocks());

test("font failure offers a system fallback without discarding the database", async () => {
  mockInitialize.mockResolvedValue({});
  mockLoadFonts.mockRejectedValue(new Error("font failed"));
  await render(
    <ServicesProvider>
      <Text>Notebook ready</Text>
    </ServicesProvider>,
  );
  expect(
    await screen.findByText("Could not load notebook fonts. You can retry or use system fonts."),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Use system fonts" }));
  expect(await screen.findByText("Notebook ready")).toBeTruthy();
  expect(mockInitialize).toHaveBeenCalledTimes(1);
});

test("database failure offers a retry without clearing data", async () => {
  mockInitialize.mockRejectedValueOnce(new Error("db failed")).mockResolvedValueOnce({});
  mockLoadFonts.mockResolvedValue(undefined);
  await render(
    <ServicesProvider>
      <Text>Notebook ready</Text>
    </ServicesProvider>,
  );
  expect(
    await screen.findByText("Could not open your database. Your data has not been deleted."),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText("Notebook ready")).toBeTruthy();
  expect(mockInitialize).toHaveBeenCalledTimes(2);
});
