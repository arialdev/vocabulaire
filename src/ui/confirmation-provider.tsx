import { useReducedMotion } from "./use-reduced-motion";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Pressable,
  type View as NativeView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { View, useTheme } from "./theme";
import { NotebookText } from "./typography";
import { ActionButton } from "./action-button";

type Request = {
  title: string;
  message: string;
  cancel: string;
  confirm: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  returnFocus?: RefObject<React.ElementRef<typeof NativeView> | null>;
};
const Context = createContext<(request: Request) => void>(() => {});
export function useConfirmation() {
  return useContext(Context);
}
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request>();
  const focus = useRef<React.ElementRef<typeof NativeView>>(null);
  const returnFrame = useRef<number | undefined>(undefined);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const close = () => {
    const target = request?.returnFocus?.current;
    const onCancel = request?.onCancel;
    setRequest(undefined);
    returnFrame.current = requestAnimationFrame(() => {
      onCancel?.();
      if (target) {
        const handle = findNodeHandle(target);
        if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
      }
    });
  };
  useEffect(
    () => () => {
      if (returnFrame.current != null) cancelAnimationFrame(returnFrame.current);
    },
    [],
  );
  useEffect(() => {
    if (!request) return;
    const frame = requestAnimationFrame(() => {
      const handle = findNodeHandle(focus.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    });
    return () => cancelAnimationFrame(frame);
  }, [request]);
  return (
    <Context.Provider value={(next) => setRequest((current) => current ?? next)}>
      {children}
      <Modal
        visible={!!request}
        transparent
        animationType={reducedMotion ? "none" : "fade"}
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.48)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              padding: 24,
              gap: 16,
              marginBottom: insets.bottom,
            }}
          >
            <Pressable ref={focus} accessible accessibilityRole="header">
              <NotebookText variant="headword" emphasis>
                {request?.title}
              </NotebookText>
            </Pressable>
            <NotebookText>{request?.message}</NotebookText>
            <ActionButton
              label={request?.cancel ?? t("Cancel")}
              variant="secondary"
              onPress={close}
            />
            <ActionButton
              label={request?.confirm ?? t("Delete")}
              variant={request?.destructive ? "destructive" : "primary"}
              onPress={() => {
                const confirmed = request?.onConfirm;
                setRequest(undefined);
                confirmed?.();
              }}
            />
          </View>
        </View>
      </Modal>
    </Context.Provider>
  );
}
