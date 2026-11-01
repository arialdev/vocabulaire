import { render, screen } from "@testing-library/react-native";
import { Appearance } from "react-native";
import { Text, ThemeProvider } from "../src/ui/theme";

test("applies the selected appearance to both native controls and app text", async () => {
  const setColorScheme = jest.spyOn(Appearance, "setColorScheme").mockImplementation(() => {});
  const view = await render(
    <ThemeProvider appearance="dark">
      <Text>Example</Text>
    </ThemeProvider>,
  );
  expect(setColorScheme).toHaveBeenLastCalledWith("dark");
  expect(screen.getByText("Example")).toHaveStyle({ color: "#f5f5f5" });
  await view.rerender(
    <ThemeProvider appearance="system">
      <Text>Example</Text>
    </ThemeProvider>,
  );
  expect(setColorScheme).toHaveBeenLastCalledWith("unspecified");
  setColorScheme.mockRestore();
});
