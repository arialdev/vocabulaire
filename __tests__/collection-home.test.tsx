import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "../src/app/index";
import "../src/i18n";

const mockSummary = { id: 1, name: "French", shortLabel: "FR", icon: "📚", termCount: 2 };
const mockRepo = {
  getPreferences: () => ({ onboardingComplete: true }),
  listCollectionSummaries: jest.fn(() => [mockSummary]),
  updatePreferences: jest.fn(),
  deleteCollection: jest.fn(),
};
const mockRefresh = jest.fn();
let mockRestored = false;
const mockSetNotice = jest.fn(() => {
  mockRestored = false;
});
jest.mock("../src/data/services", () => ({
  useServices: () => ({
    repository: mockRepo,
    refresh: mockRefresh,
    revision: 0,
    restoreNotice: mockRestored,
    setRestoreNotice: mockSetNotice,
  }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
}));

afterEach(() => {
  mockRestored = false;
  jest.clearAllMocks();
});

test("reports and dismisses a completed restore on the collections screen", async () => {
  const view = await render(<HomeScreen />);
  expect(screen.queryByText("Backup restored.")).toBeNull();
  mockRestored = true;
  await view.rerender(<HomeScreen />);
  expect(screen.getByText("Backup restored.")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Dismiss" }));
  await view.rerender(<HomeScreen />);
  expect(screen.queryByText("Backup restored.")).toBeNull();
  expect(mockSetNotice).toHaveBeenCalledWith(false);
});

test("shows real counts and confirms named deletion without showing the hidden alias", async () => {
  await render(<HomeScreen />);
  expect(await screen.findByText("2 terms")).toBeTruthy();
  expect(screen.queryByText(/\(FR\)/)).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Actions for French" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete collection" }));
  expect(
    screen.getByText("Delete French and its terms, categories and saved filters?"),
  ).toBeTruthy();
  expect(mockRepo.deleteCollection).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(mockRepo.deleteCollection).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Delete collection" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete collection" }));
  expect(mockRepo.deleteCollection).toHaveBeenCalledWith(1);
});

test("a failed summary read offers retry rather than presenting an empty notebook", async () => {
  mockRepo.listCollectionSummaries.mockImplementationOnce(() => {
    throw new Error("read failed");
  });
  await render(<HomeScreen />);
  expect(await screen.findByText("Could not load collections.")).toBeTruthy();
  expect(screen.queryByText("Create a collection to start adding vocabulary.")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(screen.getByText("2 terms")).toBeTruthy());
});
