import { useEffect, useRef, type RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';

type Target = RefObject<React.ElementRef<typeof View> | null>;
let pendingFocus: { owner: object; timer: ReturnType<typeof setTimeout> } | undefined;
/** Focus an app-owned modal on entry and its invoking control when it closes. */
export function useModalFocus(
  visible: boolean,
  initial?: Target,
  restore?: Target,
  phase?: string,
) {
  const mounted = useRef(false);
  const owner = useRef({});
  const cancelOwnFocus = () => {
    if (pendingFocus?.owner === owner.current) {
      clearTimeout(pendingFocus.timer);
      pendingFocus = undefined;
    }
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelOwnFocus();
    };
  }, []);
  useEffect(() => {
    if (!visible) return;
    const schedule = (target: Target, delay: number) => {
      if (pendingFocus) clearTimeout(pendingFocus.timer);
      const timer = setTimeout(() => {
        const handle = target.current && findNodeHandle(target.current);
        if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
        pendingFocus = undefined;
      }, delay);
      pendingFocus = { owner: owner.current, timer };
    };
    if (initial) schedule(initial, 350);
    return () => {
      cancelOwnFocus();
      if (restore && mounted.current) schedule(restore, 800);
    };
  }, [visible, initial, restore, phase]);
}
