import { fireEvent, render, screen } from "@testing-library/react-native";
import CategoriesScreen from "../src/app/collection/categories";
import "../src/i18n";

const mockCategories = [
  { id: 1, collectionId: 1, kind: "grammatical", name: "Verb" },
  { id: 2, collectionId: 1, kind: "thematic", name: "Travel" },
];
const mockRepo = {
  listCollections: () => [{ id: 1 }],
  listCategories: () => mockCategories,
  saveCategory: jest.fn(),
  deleteCategory: jest.fn(),
};
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepo, revision: 0, refresh: jest.fn() }),
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ collectionId: "1" }),
  useRouter: () => ({ back: jest.fn() }),
}));
afterEach(() => jest.clearAllMocks());

test("validates a new category and saves its chosen type", async () => {
  await render(<CategoriesScreen />);
  await fireEvent.press(screen.getByRole("button", { name: "Add category" }));
  await fireEvent.press(screen.getByRole("button", { name: "Save category" }));
  expect(screen.getByText("Enter a category name.")).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText("Category name"), "Food");
  await fireEvent.press(screen.getByRole("radio", { name: "Thematic" }));
  await fireEvent.press(screen.getByRole("button", { name: "Save category" }));
  expect(mockRepo.saveCategory).toHaveBeenCalledWith({
    collectionId: 1,
    id: undefined,
    kind: "thematic",
    name: "Food",
  });
});

test("edit locks type and deletion requires confirmation", async () => {
  await render(<CategoriesScreen />);
  await fireEvent.press(screen.getByRole("button", { name: "Edit Travel" }));
  expect(screen.getByRole("radio", { name: "Thematic" }).props.accessibilityState).toEqual({
    checked: true,
    disabled: true,
  });
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete Travel" }));
  expect(mockRepo.deleteCategory).not.toHaveBeenCalled();
  expect(
    screen.getByText("Remove Travel from terms and saved filters? Your terms will remain."),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  expect(mockRepo.deleteCategory).toHaveBeenCalledWith(1, 2);
});

test("a failed category deletion keeps the confirmation and reports the failure", async () => {
  mockRepo.deleteCategory.mockImplementationOnce(() => {
    throw new Error("write failed");
  });
  await render(<CategoriesScreen />);
  await fireEvent.press(screen.getByRole("button", { name: "Delete Travel" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  expect(screen.getByText("Could not delete the category. Please try again.")).toBeTruthy();
  expect(
    screen.getByText("Remove Travel from terms and saved filters? Your terms will remain."),
  ).toBeTruthy();
});
