import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Button } from "react-native";
import { ConfirmationProvider } from "../src/ui/confirmation-provider";
import { useUnsavedGuard } from "../src/ui/use-unsaved-guard";
import "../src/i18n";

let mockAttempt: ((event: { repeat: () => void }) => void) | undefined;
const mockRepeat = jest.fn();
const mockFocus = jest.fn();
jest.mock("expo-router", () => ({
  usePreventRemove: (_dirty: boolean, callback: typeof mockAttempt) => {
    mockAttempt = callback;
    return jest.fn();
  },
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
function Editor() {
  useUnsavedGuard(true, mockFocus);
  return <Button title="Back" onPress={() => mockAttempt?.({ repeat: mockRepeat })} />;
}
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

test("keep editing cancels the attempted exit and discard resumes it once", async () => {
  jest.useFakeTimers();
  await render(
    <ConfirmationProvider>
      <Editor />
    </ConfirmationProvider>,
  );
  await fireEvent.press(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByText("Discard changes?")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Keep editing" }));
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(mockFocus).toHaveBeenCalledTimes(1);
  expect(mockRepeat).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Back" }));
  await fireEvent.press(screen.getByRole("button", { name: "Discard" }));
  expect(mockRepeat).toHaveBeenCalledTimes(1);
});
