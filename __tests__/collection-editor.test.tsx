import { fireEvent, render, screen } from "@testing-library/react-native";
import EditCollection from "../src/app/collection/edit";
import "../src/i18n";

let mockId: string | undefined = "1";
const mockSave = jest.fn(() => ({ id: 1 }));
const mockRepository = {
  listCollections: () => [{ id: 1, name: "French", shortLabel: "FR", icon: "📚" }],
  saveCollection: mockSave,
};
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepository, refresh: jest.fn() }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: mockId }),
  useRouter: () => ({ back: jest.fn(), replace: jest.fn() }),
  usePreventRemove: () => jest.fn(),
}));
jest.mock("../modules/emoji-picker", () => () => null);

afterEach(() => {
  mockId = "1";
  jest.clearAllMocks();
});

test("renaming preserves the hidden alias without presenting an alias field", async () => {
  await render(<EditCollection />);
  expect(screen.queryByLabelText("Short label")).toBeNull();
  await fireEvent.changeText(screen.getByLabelText("Collection name"), "French notes");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(mockSave).toHaveBeenCalledWith({
    id: 1,
    name: "French notes",
    icon: "📚",
    shortLabel: "FR",
  });
});

test("a blank collection name retains the draft and cannot be saved", async () => {
  mockId = undefined;
  await render(<EditCollection />);
  await fireEvent.changeText(screen.getByLabelText("Collection name"), "  ");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Give your collection a name.")).toBeTruthy();
  expect(mockSave).not.toHaveBeenCalled();
});

test("a failed save retains the collection draft and offers retry", async () => {
  mockSave.mockImplementationOnce(() => {
    throw new Error("storage failure");
  });
  await render(<EditCollection />);
  await fireEvent.changeText(screen.getByLabelText("Collection name"), "French notes");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Could not save the collection. Please try again.")).toBeTruthy();
  expect(screen.getByLabelText("Collection name").props.value).toBe("French notes");
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(mockSave).toHaveBeenCalledTimes(2);
});
