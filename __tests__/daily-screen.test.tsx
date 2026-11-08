import { fireEvent, render, screen } from "@testing-library/react-native";
import DailyScreen from "../src/app/collection/daily";
import "../src/i18n";

let mockCount = 3;
const mockPush = jest.fn();
const mockRepo = {
  listCollections: () => [{ id: 1 }],
  listTerms: () => Array.from({ length: mockCount }, (_, i) => ({ id: i + 1, categoryIds: [7] })),
  dailyWord: () => ({
    id: 1,
    original: "flâner",
    translation: "to wander",
    notes: "Without hurry",
  }),
  listCategories: () => [{ id: 7, name: "Verb", kind: "grammatical" }],
};
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepo, revision: 0 }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ collectionId: "1" }),
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
afterEach(() => {
  mockCount = 3;
  mockPush.mockClear();
});

test("shows the real missing count and opens the owning collection editor", async () => {
  await render(<DailyScreen />);
  await fireEvent.press(await screen.findByRole("button", { name: "Add 2 more terms" }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: "/term/edit", params: { collectionId: 1 } });
});

test("shows assigned categories and opens the selected term", async () => {
  mockCount = 5;
  await render(<DailyScreen />);
  expect(await screen.findByText("flâner")).toBeTruthy();
  expect(screen.getByText("Grammatical: Verb")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Open term" }));
  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/term/[id]",
    params: { id: 1, collectionId: 1 },
  });
});
