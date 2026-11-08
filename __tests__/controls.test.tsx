import { fireEvent, render, screen } from "@testing-library/react-native";
import { CategoryChip, Feedback, Field, RadioOption, SegmentedControl } from "../src/ui/controls";

test("fields expose labels and inline errors, while typed chips announce selection", async () => {
  const onPress = jest.fn();
  await render(
    <>
      <Field label="Expression" error="Enter an expression." />
      <CategoryChip label="Verb" kind="grammatical" selected onPress={onPress} />
      <Feedback message="Save failed" error />
    </>,
  );
  expect(screen.getByLabelText("Expression")).toBeTruthy();
  expect(screen.getByText("Enter an expression.").props.accessibilityRole).toBe("alert");
  expect(screen.getByRole("checkbox", { name: "Verb" }).props.accessibilityState.checked).toBe(
    true,
  );
  await fireEvent.press(screen.getByRole("checkbox", { name: "Verb" }));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Save failed").parent?.props.accessibilityRole).toBe("alert");
});

test("radio and segmented controls expose selected state", async () => {
  const onChange = jest.fn();
  await render(
    <>
      <RadioOption label="Light" selected onPress={jest.fn()} />
      <SegmentedControl
        label="Layout"
        value="compact"
        options={[
          { value: "compact", label: "Compact" },
          { value: "detailed", label: "Detailed" },
        ]}
        onChange={onChange}
      />
    </>,
  );
  expect(screen.getByRole("radio", { name: "Light" }).props.accessibilityState.checked).toBe(true);
  await fireEvent.press(screen.getByRole("radio", { name: "Detailed" }));
  expect(onChange).toHaveBeenCalledWith("detailed");
});
