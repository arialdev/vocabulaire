import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { PdfSheet } from "../src/features/export/pdf-sheet";
import "../src/i18n";

let mockExists = true;
const mockDelete = jest.fn();
const mockPrepare = jest.fn();
const mockShare = jest.fn();
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("expo-file-system", () => ({
  File: class {
    get exists() {
      return mockExists;
    }
    delete() {
      mockDelete();
    }
  },
}));
jest.mock("../src/platform/pdf-files", () => ({
  capturePdfSnapshot: (value: unknown) => structuredClone(value),
  prepareVocabularyPdf: (...args: unknown[]) => mockPrepare(...args),
  sharePreparedVocabularyPdf: (...args: unknown[]) => mockShare(...args),
}));
const input = {
  collection: { id: 1, name: "French", icon: "📚", shortLabel: null, createdAt: "", updatedAt: "" },
  terms: [
    {
      id: 1,
      collectionId: 1,
      original: "café",
      translation: "coffee",
      notes: "",
      categoryIds: [],
      createdAt: "",
      updatedAt: "",
    },
  ],
  categories: [],
  language: "en",
  layout: "compact" as const,
};
const scope = { search: "café", categories: ["Travel"], order: "Original · A–Z" };
afterEach(() => {
  jest.clearAllMocks();
  mockExists = true;
});

test("freezes the disclosed scope, retries sharing and removes the temporary file on Done", async () => {
  mockPrepare.mockImplementation(async (snapshot) => ({
    uri: "file:///cache/result.pdf",
    filename: "result.pdf",
    snapshot,
  }));
  mockShare.mockRejectedValueOnce(new Error("share failed")).mockResolvedValueOnce(undefined);
  const close = jest.fn();
  const view = await render(<PdfSheet visible snapshot={input} scope={scope} onClose={close} />);
  await fireEvent.press(screen.getByRole("button", { name: "Create PDF" }));
  expect(await screen.findByText("result.pdf")).toBeTruthy();
  await view.rerender(
    <PdfSheet visible snapshot={input} scope={{ ...scope, search: "changed" }} onClose={close} />,
  );
  expect(screen.getByText("Search: café")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Share or save PDF" }));
  expect(
    await screen.findByText("Could not share this PDF. Please try again or create it again."),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Share or save PDF" }));
  await waitFor(() => expect(mockShare).toHaveBeenCalledTimes(2));
  expect(mockPrepare).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByRole("button", { name: "Done" }));
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
});

test("a failed preparation retains scope and can be retried", async () => {
  mockPrepare
    .mockRejectedValueOnce(new Error("print failed"))
    .mockImplementationOnce(async (snapshot) => ({
      uri: "file:///cache/result.pdf",
      filename: "result.pdf",
      snapshot,
    }));
  await render(<PdfSheet visible snapshot={input} scope={scope} onClose={jest.fn()} />);
  await fireEvent.press(screen.getByRole("button", { name: "Create PDF" }));
  expect(await screen.findByText("Could not create the PDF. Please try again.")).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Create PDF" }));
  expect(await screen.findByText("result.pdf")).toBeTruthy();
});

test("duplicate creation is blocked while generation is pending", async () => {
  let finish!: (value: unknown) => void;
  mockPrepare.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await render(<PdfSheet visible snapshot={input} scope={scope} onClose={jest.fn()} />);
  const create = screen.getByRole("button", { name: "Create PDF" });
  await fireEvent.press(create);
  await fireEvent.press(create);
  expect(mockPrepare).toHaveBeenCalledTimes(1);
  finish({ uri: "file:///cache/result.pdf", filename: "result.pdf", snapshot: input });
  expect(await screen.findByText("result.pdf")).toBeTruthy();
});

test("an expired prepared file is reported without opening the share sheet", async () => {
  mockPrepare.mockImplementation(async (snapshot) => ({
    uri: "file:///cache/result.pdf",
    filename: "result.pdf",
    snapshot,
  }));
  await render(<PdfSheet visible snapshot={input} scope={scope} onClose={jest.fn()} />);
  await fireEvent.press(screen.getByRole("button", { name: "Create PDF" }));
  await screen.findByText("result.pdf");
  mockExists = false;
  await fireEvent.press(screen.getByRole("button", { name: "Share or save PDF" }));
  expect(
    await screen.findByText("Could not share this PDF. Please try again or create it again."),
  ).toBeTruthy();
  expect(mockShare).not.toHaveBeenCalled();
});
