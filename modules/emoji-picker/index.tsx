import { Text, type ViewProps } from "react-native";
export default function EmojiPickerFallback(
  _props: ViewProps & {
    language: string;
    onEmojiPicked: (event: { nativeEvent: { emoji: string } }) => void;
  },
) {
  return <Text>Emoji picker is currently available on Android.</Text>;
}
