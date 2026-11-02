import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import BackupScreen from "../src/app/backup";
import { ConfirmationProvider } from "../src/ui/confirmation-provider";
import "../src/i18n";

const backup = {
  format: "vocabulaire",
  schemaVersion: 1,
  exportedAt: "2026-10-29T12:00:00.000Z",
  data: {
    collections: [{ id: 1, shortLabel: "FR" }],
    terms: [],
    categories: [],
    savedFilters: [],
    termCategories: [],
    savedFilterCategories: [],
    dailyPicks: [],
    preferences: [],
  },
};
const mockSelect = jest.fn();
const mockPrepare = jest.fn();
const mockShare = jest.fn();
const mockReplace = jest.fn();
const mockUpdate = jest.fn();
const mockRefresh = jest.fn();
const mockNotice = jest.fn();
const mockNavigate = jest.fn();
const mockRepo = { getPreferences: () => ({ locale: "en" }), updatePreferences: mockUpdate };
jest.mock("../src/data/services", () => ({
  useServices: () => ({
    db: {},
    repository: mockRepo,
    refresh: mockRefresh,
    setRestoreNotice: mockNotice,
  }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ fromOnboarding: "1" }),
  usePreventRemove: jest.fn(),
  useRouter: () => ({ dismissAll: jest.fn(), replace: mockNavigate }),
}));
jest.mock("expo-file-system", () => ({
  File: class {
    exists = true;
    delete() {}
  },
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../src/platform/backup", () => ({
  ...jest.requireActual("../src/platform/backup"),
  replaceFromBackup: (...args: unknown[]) => mockReplace(...args),
}));
jest.mock("../src/platform/backup-files", () => ({
  BackupSelectionError: class extends Error {
    reason: string;
    filename: string;
    constructor(reason: string, filename: string) {
      super(reason);
      this.reason = reason;
      this.filename = filename;
    }
  },
  selectBackup: () => mockSelect(),
  prepareBackup: () => mockPrepare(),
  sharePreparedBackup: (...args: unknown[]) => mockShare(...args),
}));
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

async function openPreview() {
  mockSelect.mockResolvedValueOnce({ filename: "notebook.json", backup });
  await render(
    <ConfirmationProvider>
      <BackupScreen />
    </ConfirmationProvider>,
  );
  await fireEvent.press(screen.getByRole("button", { name: "Choose backup to restore" }));
  expect(await screen.findByText("notebook.json")).toBeTruthy();
}

test("picker cancel and optional export retain a validated restore candidate", async () => {
  await openPreview();
  expect(screen.queryByRole("button", { name: "Review restoring state" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Review rollback state" })).toBeNull();
  mockSelect.mockResolvedValueOnce(undefined);
  await fireEvent.press(screen.getByRole("button", { name: "Choose another file" }));
  expect(screen.getByText("notebook.json")).toBeTruthy();
  mockPrepare.mockResolvedValueOnce({
    uri: "file:///cache/current.json",
    filename: "current.json",
    snapshot: backup,
  });
  await fireEvent.press(screen.getByRole("button", { name: "Export current data first" }));
  expect(await screen.findByText("current.json")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Done" }));
  expect(screen.getByText("notebook.json")).toBeTruthy();
  expect(mockReplace).not.toHaveBeenCalled();
});

test("canceling final confirmation preserves the candidate and never replaces data", async () => {
  await openPreview();
  await fireEvent.press(screen.getByRole("button", { name: "Continue to confirmation" }));
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByText("notebook.json")).toBeTruthy();
  expect(mockReplace).not.toHaveBeenCalled();
});

test("restore paints its busy state before transaction and completes onboarding after success", async () => {
  jest.useFakeTimers();
  await openPreview();
  await fireEvent.press(screen.getByRole("button", { name: "Continue to confirmation" }));
  await fireEvent.press(screen.getByRole("button", { name: "Replace all data" }));
  expect(screen.getByText("Restoring backup…")).toBeTruthy();
  expect(mockReplace).not.toHaveBeenCalled();
  await act(() => {
    jest.runAllTimers();
  });
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  expect(mockNotice).toHaveBeenCalledWith(true);
  expect(mockReplace).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledWith({ onboardingComplete: true });
});

test("a transaction failure exposes rollback recovery without announcing success", async () => {
  jest.useFakeTimers();
  const { RestoreFailure } = require("../src/platform/backup");
  mockReplace.mockImplementationOnce(() => {
    throw new RestoreFailure("unchanged");
  });
  await openPreview();
  await fireEvent.press(screen.getByRole("button", { name: "Continue to confirmation" }));
  await fireEvent.press(screen.getByRole("button", { name: "Replace all data" }));
  await act(() => {
    jest.runAllTimers();
  });
  expect(await screen.findByText("Restore failed. Your previous data was kept.")).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("post-commit failures report the completed restore rather than claiming rollback", async () => {
  jest.useFakeTimers();
  mockUpdate.mockImplementationOnce(() => {
    throw new Error("preferences refresh failed");
  });
  await openPreview();
  await fireEvent.press(screen.getByRole("button", { name: "Continue to confirmation" }));
  await fireEvent.press(screen.getByRole("button", { name: "Replace all data" }));
  await act(() => {
    jest.runAllTimers();
  });
  expect(
    await screen.findByText(
      "Data was restored, but the screen could not refresh. Restart the app.",
    ),
  ).toBeTruthy();
  expect(mockReplace).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Restore failed. Your previous data was kept.")).toBeNull();
});

test("duplicate export taps cannot prepare concurrent snapshots", async () => {
  let finish!: (value: unknown) => void;
  mockPrepare.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await render(
    <ConfirmationProvider>
      <BackupScreen />
    </ConfirmationProvider>,
  );
  const exportButton = screen.getByRole("button", { name: "Export current data" });
  await fireEvent.press(exportButton);
  await fireEvent.press(exportButton);
  expect(mockPrepare).toHaveBeenCalledTimes(1);
  finish({ uri: "file:///cache/current.json", filename: "current.json", snapshot: backup });
  expect(await screen.findByText("current.json")).toBeTruthy();
});

test("an unconfirmed rollback does not claim that previous data was preserved", async () => {
  jest.useFakeTimers();
  const { RestoreFailure } = require("../src/platform/backup");
  mockReplace.mockImplementationOnce(() => {
    throw new RestoreFailure("unknown");
  });
  await openPreview();
  await fireEvent.press(screen.getByRole("button", { name: "Continue to confirmation" }));
  await fireEvent.press(screen.getByRole("button", { name: "Replace all data" }));
  await act(() => {
    jest.runAllTimers();
  });
  expect(
    await screen.findByText(
      "Restore outcome could not be confirmed. Restart the app before trying again.",
    ),
  ).toBeTruthy();
  expect(screen.queryByText("Restore failed. Your previous data was kept.")).toBeNull();
});
