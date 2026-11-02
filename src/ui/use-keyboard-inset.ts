import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** Allow the final form controls to scroll above Android's on-screen keyboard. */
export function useKeyboardInset() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}
