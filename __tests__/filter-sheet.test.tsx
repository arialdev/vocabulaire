import { fireEvent, render, screen } from "@testing-library/react-native";
import { FilterSheet } from "../src/features/vocabulary/filter-sheet";
import "../src/i18n";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("../modules/emoji-picker", () => {
  const { Button } = require("react-native");
  return ({
    onEmojiPicked,
  }: {
    onEmojiPicked: (e: { nativeEvent: { emoji: string } }) => void;
  }) => (
    <Button title="Pick emoji" onPress={() => onEmojiPicked({ nativeEvent: { emoji: "👩🏽‍💻" } })} />
  );
});
const categories = [
  { id: 1, collectionId: 1, name: "Verb", kind: "grammatical" as const },
  { id: 2, collectionId: 1, name: "Travel", kind: "thematic" as const },
];
const terms = [
  {
    id: 1,
    collectionId: 1,
    original: "café",
    translation: "coffee",
    notes: "",
    categoryIds: [1, 2],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 2,
    collectionId: 1,
    original: "café au lait",
    translation: "coffee with milk",
    notes: "",
    categoryIds: [],
    createdAt: "",
    updatedAt: "",
  },
];
const repository = { saveFilter: jest.fn(), deleteFilter: jest.fn() } as never;
const apply = jest.fn(() => true);
const close = jest.fn();
const applySaved = jest.fn();
const props = {
  collectionId: 1,
  search: "café",
  categories,
  terms,
  selected: [],
  display: { detailed: false, field: "original" as const, direction: "asc" as const },
  saved: [],
  repository,
  refresh: jest.fn(),
  onClose: close,
  onApply: apply,
  onApplySaved: applySaved,
  onDeleteSaved: jest.fn(),
};
afterEach(() => jest.clearAllMocks());

test("cross-tab drafts survive and only commit with Apply", async () => {
  await render(<FilterSheet {...props} />);
  await fireEvent.press(screen.getByRole("checkbox", { name: "Travel" }));
  expect(screen.getByText("1 term")).toBeTruthy();
  await fireEvent.press(screen.getByRole("tab", { name: "Display" }));
  await fireEvent.press(screen.getByRole("radio", { name: "Detailed view" }));
  await fireEvent.press(screen.getByRole("tab", { name: "Categories" }));
  expect(screen.getByRole("checkbox", { name: "Travel" }).props.accessibilityState.checked).toBe(
    true,
  );
  expect(apply).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Apply" }));
  expect(apply).toHaveBeenCalledWith([2], { detailed: true, field: "original", direction: "asc" });
  expect(close).toHaveBeenCalled();
});

test("save child captures displayed criteria and preserves parent draft through emoji cancel", async () => {
  await render(<FilterSheet {...props} />);
  await fireEvent.press(screen.getByRole("checkbox", { name: "Travel" }));
  await fireEvent.press(screen.getByRole("button", { name: "Save current selection" }));
  await fireEvent.changeText(screen.getByLabelText("Saved filter name"), "My filter");
  await fireEvent.press(screen.getByRole("button", { name: "Choose filter icon: ⭐" }));
  await fireEvent.press(screen.getByRole("button", { name: "Pick emoji" }));
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByLabelText("Saved filter name").props.value).toBe("My filter");
  await fireEvent.press(screen.getByRole("button", { name: "Save filter" }));
  expect((repository as any).saveFilter).toHaveBeenCalledWith({
    collectionId: 1,
    name: "My filter",
    icon: "⭐",
    search: "café",
    categoryIds: [2],
  });
  expect(apply).not.toHaveBeenCalled();
  expect(screen.getByRole("checkbox", { name: "Travel" }).props.accessibilityState.checked).toBe(
    true,
  );
});

test("a failed preference write retains the sheet and draft", async () => {
  apply.mockReturnValueOnce(false);
  await render(<FilterSheet {...props} />);
  await fireEvent.press(screen.getByRole("checkbox", { name: "Travel" }));
  await fireEvent.press(screen.getByRole("button", { name: "Apply" }));
  expect(screen.getByText("Could not save your settings. Please try again.")).toBeTruthy();
  expect(screen.getByRole("checkbox", { name: "Travel" }).props.accessibilityState.checked).toBe(
    true,
  );
  expect(close).not.toHaveBeenCalled();
});

test("a saved filter applies immediately without committing a pending display edit", async () => {
  const saved = [
    { id: 8, collectionId: 1, name: "Café", icon: "☕", search: "café", categoryIds: [1] },
  ];
  await render(<FilterSheet {...props} saved={saved} />);
  await fireEvent.press(screen.getByRole("tab", { name: "Display" }));
  await fireEvent.press(screen.getByRole("radio", { name: "Detailed view" }));
  await fireEvent.press(screen.getByRole("tab", { name: "Saved filters" }));
  await fireEvent.press(screen.getByRole("button", { name: "Apply Café" }));
  expect(applySaved).toHaveBeenCalledWith(saved[0]);
  expect(apply).not.toHaveBeenCalled();
});

test("a deleted category is removed from a retained draft", async () => {
  const view = await render(<FilterSheet {...props} />);
  await fireEvent.press(screen.getByRole("checkbox", { name: "Travel" }));
  await view.rerender(<FilterSheet {...props} categories={[categories[0]]} />);
  await fireEvent.press(screen.getByRole("button", { name: "Apply" }));
  expect(apply).toHaveBeenCalledWith([], props.display);
});

test("cancel discards pending categories and display changes when reopened", async () => {
  const view = await render(<FilterSheet {...props} />);
  await fireEvent.press(screen.getByRole("checkbox", { name: "Travel" }));
  await fireEvent.press(screen.getByRole("tab", { name: "Display" }));
  await fireEvent.press(screen.getByRole("radio", { name: "Detailed view" }));
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(apply).not.toHaveBeenCalled();
  await view.unmount();
  await render(<FilterSheet {...props} />);
  expect(screen.getByRole("checkbox", { name: "Travel" }).props.accessibilityState.checked).toBe(
    false,
  );
  await fireEvent.press(screen.getByRole("tab", { name: "Display" }));
  expect(screen.getByRole("radio", { name: "Compact view" }).props.accessibilityState.checked).toBe(
    true,
  );
});

test("applying a compound emoji changes only the unsaved filter draft", async () => {
  await render(<FilterSheet {...props} />);
  await fireEvent.press(screen.getByRole("button", { name: "Save current selection" }));
  await fireEvent.press(screen.getByRole("button", { name: "Choose filter icon: ⭐" }));
  await fireEvent.press(screen.getByRole("button", { name: "Pick emoji" }));
  await fireEvent.press(screen.getByRole("button", { name: "Apply emoji" }));
  expect(screen.getByRole("button", { name: "Choose filter icon: 👩🏽‍💻" })).toBeTruthy();
  expect((repository as any).saveFilter).not.toHaveBeenCalled();
});
