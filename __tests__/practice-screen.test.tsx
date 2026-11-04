import { fireEvent, render, screen } from "@testing-library/react-native";
import PracticeScreen from "../src/app/collection/practice";
import "../src/i18n";

let mockTerms = [
  { id: 1, original: "bonjour", translation: "hello" },
  { id: 2, original: "merci", translation: "thank you" },
];
const mockRepository = {
  listCollections: () => [{ id: 1 }],
  listTerms: () => mockTerms,
};
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepository, revision: 0 }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ collectionId: "1" }),
  useRouter: () => ({ back: jest.fn() }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

afterEach(() => {
  mockTerms = [
    { id: 1, original: "bonjour", translation: "hello" },
    { id: 2, original: "merci", translation: "thank you" },
  ];
  jest.restoreAllMocks();
});

test("reveals, hides, and advances to a different hidden translation", async () => {
  jest.spyOn(Math, "random").mockReturnValue(0);
  await render(<PracticeScreen />);
  const card = await screen.findByRole("button", { name: "bonjour, Show translation" });
  expect(screen.queryByText("hello")).toBeNull();
  await fireEvent.press(card);
  expect(screen.getByText("hello")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "bonjour, hello, Hide translation" }));
  expect(screen.queryByText("hello")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "bonjour, Show translation" }));
  await fireEvent.press(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("button", { name: "merci, Show translation" })).toBeTruthy();
  expect(screen.queryByText("thank you")).toBeNull();
});

test("shows an empty collection", async () => {
  mockTerms = [];
  await render(<PracticeScreen />);
  expect(await screen.findByText("A new word is a good beginning.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
});

test("allows revealing the single term and disables Next", async () => {
  mockTerms = [mockTerms[0]];
  await render(<PracticeScreen />);
  await fireEvent.press(await screen.findByRole("button", { name: "bonjour, Show translation" }));
  expect(screen.getByText("hello")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Next" }).props.accessibilityState.disabled).toBe(true);
});

test("offers retry after a read failure", async () => {
  jest.spyOn(mockRepository, "listTerms").mockImplementationOnce(() => {
    throw new Error("read failed");
  });
  await render(<PracticeScreen />);
  await fireEvent.press(await screen.findByRole("button", { name: "Retry" }));
  expect(await screen.findByText(/bonjour|merci/)).toBeTruthy();
});
