import { fireEvent, render, screen } from "@testing-library/react-native";
import CollectionScreen from "../src/app/collection/[id]";

const terms = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  collectionId: 1,
  original: `Word ${index + 1}`,
  translation: index === 499 ? "café" : "translation",
  notes: index === 499 ? "A detailed note" : "",
  categoryIds: [],
  createdAt: "",
  updatedAt: "",
}));
const mockRepository = {
  listCollections: () => [{ id: 1, name: "Test", icon: "📚" }],
  listTerms: jest.fn(() => terms),
  listCategories: () => [],
  listFilters: () => [],
  getPreferences: () => ({ termView: "compact", sortField: "original", sortDirection: "asc" }),
  updatePreferences: jest.fn(),
};
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepository, revision: 0, refresh: jest.fn() }),
}));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: "1" }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("../modules/emoji-picker", () => () => null);
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

test("search survives display and sorting changes in a large collection", async () => {
  await render(<CollectionScreen />);
  await fireEvent.changeText(await screen.findByLabelText("Search vocabulary"), "CAFE");
  expect(screen.getByText("Word 500")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Filters and display" }));
  await fireEvent.press(screen.getByRole("tab", { name: "Display" }));
  await fireEvent.press(screen.getByRole("radio", { name: "Detailed view" }));
  await fireEvent.press(screen.getByRole("button", { name: "Apply" }));
  expect(screen.getByText("Word 500")).toBeTruthy();
  expect(screen.getByText("A detailed note")).toBeTruthy();
  expect(screen.getByLabelText("Search vocabulary").props.value).toBe("CAFE");
  await fireEvent.changeText(screen.getByLabelText("Search vocabulary"), "no such term");
  expect(screen.getByText("No words on this page.")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Clear search and filters" }));
  expect(screen.getByLabelText("Search vocabulary").props.value).toBe("");
});

test("read failure is distinct from empty data and can be retried", async () => {
  mockRepository.listTerms.mockImplementationOnce(() => {
    throw new Error("read failed");
  });
  await render(<CollectionScreen />);
  expect(await screen.findByText("Could not load vocabulary.")).toBeTruthy();
  expect(screen.queryByText("No terms yet.")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByLabelText("Search vocabulary")).toBeTruthy();
});

test("long expressions and translations remain untruncated in compact rows", async () => {
  const longOriginal = "日本語の長い表現 ".repeat(10);
  const longTranslation = "A long translation that must wrap rather than disappear. ".repeat(8);
  mockRepository.listTerms.mockReturnValueOnce([
    { ...terms[0], original: longOriginal, translation: longTranslation },
  ]);
  await render(<CollectionScreen />);
  const original = await screen.findByText(longOriginal);
  const translation = screen.getByText(longTranslation);
  expect(original.props.numberOfLines).toBeUndefined();
  expect(translation.props.numberOfLines).toBeUndefined();
  expect(screen.getByRole("button", { name: `Actions for ${longOriginal}` })).toBeTruthy();
});
