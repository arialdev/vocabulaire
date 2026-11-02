import { requireNativeView } from "expo";
import type { ViewProps } from "react-native";

type Props = ViewProps & {
  language: string;
  appearance: "light" | "dark";
  onEmojiPicked: (event: { nativeEvent: { emoji: string } }) => void;
};
export default requireNativeView<Props>("VocabulaireEmojiPicker");
