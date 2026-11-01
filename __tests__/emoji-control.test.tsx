import { fireEvent, render, screen } from "@testing-library/react-native";
import { EmojiControl } from "../src/ui/emoji-control";
import "../src/i18n";

jest.mock("../modules/emoji-picker", () => {
  const { Button } = require("react-native");
  return ({
    onEmojiPicked,
  }: {
    onEmojiPicked: (event: { nativeEvent: { emoji: string } }) => void;
  }) => (
    <Button
      title="Select compound emoji"
      onPress={() => onEmojiPicked({ nativeEvent: { emoji: "👩🏽‍💻" } })}
    />
  );
});

test("picker selection returns the full sequence and cancellation preserves the draft", async () => {
  const onChange = jest.fn();
  await render(<EmojiControl value="🇪🇸" label="Choose icon" onChange={onChange} />);
  await fireEvent.press(screen.getByRole("button", { name: "Choose icon: 🇪🇸" }));
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(onChange).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole("button", { name: "Choose icon: 🇪🇸" }));
  await fireEvent.press(screen.getByRole("button", { name: "Select compound emoji" }));
  expect(onChange).toHaveBeenCalledWith("👩🏽‍💻");
});
