import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
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
const mockRepository = {
  listCollections: () => [{ id: 1 }],
  listTerms: () => [term],
  listCategories: () => [],
  saveTerm: jest.fn(),
  deleteTerm: jest.fn(),
};
const mockBack = jest.fn();
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepository, revision: 0, refresh: jest.fn() }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
  usePreventRemove: () => jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  mockParams = { collectionId: "1" };
});

test("whitespace-only expressions are rejected before saving", async () => {
  await render(<EditTerm />);
  await fireEvent.changeText(screen.getByLabelText("Original expression"), "  ");
  await fireEvent.changeText(screen.getByLabelText("Translation"), "cat");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(
    screen.getByText("Enter an original expression and translation to save the term."),
  ).toBeTruthy();
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
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  await render(<TermDetails />);
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  expect(mockRepository.deleteTerm).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2]!;
  expect(buttons[0].style).toBe("cancel");
  expect(mockRepository.deleteTerm).not.toHaveBeenCalled();
  buttons[1].onPress!();
  expect(mockRepository.deleteTerm).toHaveBeenCalledWith(1, 7);
  expect(mockBack).toHaveBeenCalled();
});

test("a failed confirmed deletion reports an error and keeps the details open", async () => {
  mockParams = { collectionId: "1", id: "7" };
  mockRepository.deleteTerm.mockImplementationOnce(() => {
    throw new Error("database unavailable");
  });
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  await render(<TermDetails />);
  await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
  await act(() => alert.mock.calls[0][2]![1].onPress!());
  expect(screen.getByText("Could not delete term.")).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();
});
