import React from "react";
import { act, render, renderHook } from "@testing-library/react-native";
import { useModalFocus } from "../src/ui/use-modal-focus";

const mockSetFocus = jest.fn();
jest.mock("react-native", () => ({
  AccessibilityInfo: { setAccessibilityFocus: (handle: number) => mockSetFocus(handle) },
  findNodeHandle: (target: { handle: number }) => target.handle,
}));

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});
test("focus moves into the overlay and returns to its invoking control on dismissal", async () => {
  jest.useFakeTimers();
  const initial = { current: { handle: 11 } } as never;
  const opener = { current: { handle: 22 } } as never;
  const view = await renderHook(
    ({ visible }: { visible: boolean }) => useModalFocus(visible, initial, opener),
    {
      initialProps: { visible: true },
    },
  );
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(mockSetFocus).toHaveBeenLastCalledWith(11);
  await view.rerender({ visible: false });
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(mockSetFocus).toHaveBeenLastCalledWith(22);
});

test("does not schedule focus after the owning screen unmounts", async () => {
  jest.useFakeTimers();
  const initial = { current: { handle: 11 } } as never;
  const opener = { current: { handle: 22 } } as never;
  const view = await renderHook(() => useModalFocus(true, initial, opener));
  await view.unmount();
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(mockSetFocus).not.toHaveBeenCalled();
});

test("a persistent owner restores focus when its conditionally mounted sheet closes", async () => {
  jest.useFakeTimers();
  const opener = { current: { handle: 22 } } as never;
  const view = await renderHook(
    ({ visible }: { visible: boolean }) => useModalFocus(visible, undefined, opener),
    { initialProps: { visible: true } },
  );
  await view.rerender({ visible: false });
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(mockSetFocus).toHaveBeenLastCalledWith(22);
});

test("unmounting a sheet does not cancel its owner's focus restoration", async () => {
  jest.useFakeTimers();
  const opener = { current: { handle: 22 } } as never;
  const heading = { current: { handle: 11 } } as never;
  function Sheet() {
    useModalFocus(true, heading);
    return null;
  }
  function Owner({ visible }: { visible: boolean }) {
    useModalFocus(visible, undefined, opener);
    return visible ? <Sheet /> : null;
  }
  const view = await render(<Owner visible />);
  await view.rerender(<Owner visible={false} />);
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(mockSetFocus).toHaveBeenLastCalledWith(22);
});

test("opening the next sheet takes precedence over restoring the previous opener", async () => {
  jest.useFakeTimers();
  const opener = { current: { handle: 22 } } as never;
  const nextHeading = { current: { handle: 33 } } as never;
  function Handoff({ next }: { next: boolean }) {
    useModalFocus(!next, undefined, opener);
    useModalFocus(next, nextHeading);
    return null;
  }
  const view = await render(<Handoff next={false} />);
  await view.rerender(<Handoff next />);
  await act(() => {
    jest.runAllTimers();
  });
  expect(mockSetFocus).toHaveBeenCalledTimes(1);
  expect(mockSetFocus).toHaveBeenCalledWith(33);
});
