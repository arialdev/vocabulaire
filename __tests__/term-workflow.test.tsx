import { fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import EditTerm from "../src/app/term/edit";
import TermDetails from "../src/app/term/[id]";
import "../src/i18n";

let mockParams: { collectionId: string; id?: string } = { collectionId: "1" };
const term = {
  id: 7,
  collectionId: 1,
  original: "猫",
  translation: "cat",
  notes: "",
  categoryIds: [],
  createdAt: "",
  updatedAt: "",
};
let mockCategories: { id: number; kind: "grammatical" | "thematic"; name: string }[] = [];
let mockRevision = 0;
const mockPush = jest.fn();
const mockRepository = {
  listCollections: () => [{ id: 1 }],
  listTerms: () => [term],
  listCategories: () => mockCategories,
  saveTerm: jest.fn(),
  deleteTerm: jest.fn(),
};
const mockBack = jest.fn();
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepository, revision: mockRevision, refresh: jest.fn() }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: mockBack, push: mockPush }),
  usePreventRemove: () => jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  mockParams = { collectionId: "1" };
  mockCategories = [];
  mockRevision = 0;
});

test("whitespace-only expressions are rejected before saving", async () => {
  await render(<EditTerm />);
  await fireEvent.changeText(screen.getByLabelText("Original expression"), "  ");
  await fireEvent.changeText(screen.getByLabelText("Translation"), "cat");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Enter an expression.")).toBeTruthy();
  expect(mockRepository.saveTerm).not.toHaveBeenCalled();
});

test("missing edit and detail routes show a recoverable message", async () => {
  mockParams = { collectionId: "1", id: "999" };
  const view = await render(<EditTerm />);
  expect(screen.getByText("Term or collection not found.")).toBeTruthy();
  await view.rerender(<TermDetails />);
  expect(screen.getByText("Term or collection not found.")).toBeTruthy();
});

test("deletion happens only after confirmation", async () => {
  mockParams = { collectionId: "1", id: "7" };
  await render(<TermDetails />);
  await fireEvent.press(screen.getByRole("button", { name: "Actions for 猫" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  expect(mockRepository.deleteTerm).not.toHaveBeenCalled();
  expect(screen.getByText("Delete 猫?")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  expect(mockRepository.deleteTerm).toHaveBeenCalledWith(1, 7);
  expect(mockBack).toHaveBeenCalled();
});

test("a failed confirmed deletion reports an error and keeps the details open", async () => {
  mockParams = { collectionId: "1", id: "7" };
  mockRepository.deleteTerm.mockImplementationOnce(() => {
    throw new Error("database unavailable");
  });
  await render(<TermDetails />);
  await fireEvent.press(screen.getByRole("button", { name: "Actions for 猫" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  expect(screen.getByText("Could not delete term.")).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();
});

test("both required fields report errors while retaining notes", async () => {
  const announce = jest
    .spyOn(AccessibilityInfo, "announceForAccessibility")
    .mockImplementation(() => {});
  await render(<EditTerm />);
  await fireEvent.changeText(screen.getByLabelText("Notes"), "Keep this draft");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Enter an expression.")).toBeTruthy();
  expect(screen.getByText("Add a translation.")).toBeTruthy();
  expect(announce).toHaveBeenCalledWith("Enter an expression.");
  expect(screen.getByLabelText("Notes").props.value).toBe("Keep this draft");
  expect(mockRepository.saveTerm).not.toHaveBeenCalled();
});

test("a rejected write keeps the term draft available", async () => {
  mockRepository.saveTerm.mockImplementationOnce(() => {
    throw new Error("storage failure");
  });
  await render(<EditTerm />);
  await fireEvent.changeText(screen.getByLabelText("Original expression"), "猫");
  await fireEvent.changeText(screen.getByLabelText("Translation"), "cat");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Could not save the term. Please try again.")).toBeTruthy();
  expect(screen.getByLabelText("Original expression").props.value).toBe("猫");
  expect(mockBack).not.toHaveBeenCalled();
});

test("category management retains the draft and prunes a deleted selection", async () => {
  mockCategories = [
    { id: 3, kind: "grammatical", name: "Verb" },
    { id: 4, kind: "thematic", name: "Travel" },
  ];
  const view = await render(<EditTerm />);
  await fireEvent.changeText(screen.getByLabelText("Original expression"), "flâner");
  await fireEvent.changeText(screen.getByLabelText("Translation"), "wander");
  await fireEvent.changeText(screen.getByLabelText("Notes"), "draft notes");
  await fireEvent.press(screen.getByRole("checkbox", { name: "Verb" }));
  await fireEvent.press(screen.getByRole("checkbox", { name: "Travel" }));
  await fireEvent.press(screen.getByRole("button", { name: "Manage categories" }));
  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/collection/categories",
    params: { collectionId: 1 },
  });
  mockCategories = [{ id: 4, kind: "thematic", name: "Travel" }];
  mockRevision++;
  await view.rerender(<EditTerm />);
  expect(screen.getByLabelText("Notes").props.value).toBe("draft notes");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(mockRepository.saveTerm).toHaveBeenCalledWith(
    expect.objectContaining({
      original: "flâner",
      translation: "wander",
      notes: "draft notes",
      categoryIds: [4],
    }),
  );
});
