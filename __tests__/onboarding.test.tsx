import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated } from "react-native";
import { Intro } from "../src/features/onboarding/intro";
import { introSwipeDelta, nextIntroStep } from "../src/features/onboarding/transitions";
import "../src/i18n";

let mockStep = 0;
let mockReducedMotion = true;
const mockUpdate = jest.fn((values: { onboardingStep?: number; onboardingComplete?: boolean }) => {
  if (values.onboardingStep != null) mockStep = values.onboardingStep;
});
const mockPush = jest.fn();
const mockRepo = {
  getPreferences: () => ({ onboardingStep: mockStep }),
  updatePreferences: mockUpdate,
};
jest.mock("../src/data/services", () => ({
  useServices: () => ({ repository: mockRepo, refresh: jest.fn() }),
}));
jest.mock("../src/ui/use-reduced-motion", () => ({
  useReducedMotion: () => mockReducedMotion,
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));
afterEach(() => {
  mockStep = 0;
  mockReducedMotion = true;
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

test("animates page changes only when reduced motion is off", async () => {
  const timing = jest.spyOn(Animated, "timing");
  const view = await render(<Intro />);
  await fireEvent.press(screen.getByRole("button", { name: "Next" }));
  await view.rerender(<Intro />);
  expect(timing).not.toHaveBeenCalled();

  mockReducedMotion = false;
  await view.rerender(<Intro />);
  expect(timing).toHaveBeenCalledTimes(2);
  await fireEvent.press(screen.getByRole("button", { name: "Next" }));
  await view.rerender(<Intro />);
  expect(timing).toHaveBeenCalledTimes(4);
});

test("swipe direction, incomplete and edge gestures, and step bounds", () => {
  expect(introSwipeDelta(90, 3, 100)).toBe(-1);
  expect(introSwipeDelta(-90, 3, 100)).toBe(1);
  expect(introSwipeDelta(40, 2, 100)).toBe(0);
  expect(introSwipeDelta(90, 3, 10)).toBe(0);
  expect(introSwipeDelta(70, 80, 100)).toBe(0);
  expect(nextIntroStep(0, -1)).toBe(0);
  expect(nextIntroStep(3, 1)).toBe(3);
});

test("buttons persist completed transitions and resume the stored page", async () => {
  const view = await render(<Intro />);
  await fireEvent.press(screen.getByRole("button", { name: "Next" }));
  expect(mockUpdate).toHaveBeenCalledWith({ onboardingStep: 1 });
  await view.rerender(<Intro />);
  expect(screen.getByText("Keep the whole expression")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Back" }));
  expect(mockUpdate).toHaveBeenLastCalledWith({ onboardingStep: 0 });
});

test("start choices preserve progress on cancel and create completes without creating records", async () => {
  mockStep = 2;
  await render(<Intro />);
  await fireEvent.press(screen.getByRole("button", { name: "Get started" }));
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(mockUpdate).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Get started" }));
  await fireEvent.press(screen.getByRole("button", { name: "Create a collection" }));
  expect(mockUpdate).toHaveBeenCalledWith({ onboardingComplete: true, onboardingStep: 2 });
  expect(mockPush).toHaveBeenCalledWith("/collection/edit");
});
