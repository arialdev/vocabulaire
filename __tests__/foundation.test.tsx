import { fireEvent, render, screen } from "@testing-library/react-native";
import { renderRouter, testRouter } from "expo-router/testing-library";
import { Text } from "react-native";

import { ActionButton } from "@/ui/action-button";

test("a disabled action cannot be invoked", async () => {
  const onPress = jest.fn();
  await render(<ActionButton label="Save" onPress={onPress} disabled />);
  await fireEvent.press(screen.getByRole("button", { name: "Save" }));
  expect(onPress).not.toHaveBeenCalled();
});

test("the router navigates between native screens", async () => {
  await renderRouter(
    {
      index: () => <Text>Home</Text>,
      details: () => <Text>Details</Text>,
    },
    { initialUrl: "/" },
  );

  await testRouter.push("/details");
  expect(screen.getByText("Details")).toBeTruthy();
});
