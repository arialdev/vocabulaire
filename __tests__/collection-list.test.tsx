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
const repository = {
  listCollections: () => [{ id: 1, name: "Test", icon: "📚" }],
  listTerms: () => terms,
  listCategories: () => [],
  listFilters: () => [],
};
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository, revision: 0, refresh: jest.fn() }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "1" }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("../modules/emoji-picker", () => () => null);

test("search survives display and sorting changes in a large collection", async () => {
  await render(<CollectionScreen />);
  await fireEvent.changeText(screen.getByLabelText("Search vocabulary"), "CAFE");
  expect(screen.getByText("Word 500 — café")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Filters and display" }));
  await fireEvent.press(screen.getByRole("button", { name: "Detailed view" }));
  await fireEvent.press(screen.getByRole("button", { name: "Sort: original" }));
  await fireEvent.press(screen.getByRole("button", { name: "Done" }));
  expect(screen.getByText("Word 500 — café")).toBeTruthy();
  expect(screen.getByText("A detailed note")).toBeTruthy();
  expect(screen.getByLabelText("Search vocabulary").props.value).toBe("CAFE");
  await fireEvent.changeText(screen.getByLabelText("Search vocabulary"), "no such term");
  expect(screen.getByText("No matching terms.")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Clear search and filters" }));
  expect(screen.getByLabelText("Search vocabulary").props.value).toBe("");
});
