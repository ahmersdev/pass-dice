import { StyleSheet } from "react-native-unistyles";
import type { IIconButtonSize } from "./icon-button.interface";

const SIZES: Record<IIconButtonSize, { side: number; radius: number }> = {
  medium: { side: 44, radius: 12 },
  large: { side: 52, radius: 14 },
};

export const iconButtonStyles = StyleSheet.create((theme) => ({
  button: (size: IIconButtonSize, disabled: boolean) => ({
    width: SIZES[size].side,
    height: SIZES[size].side,
    borderRadius: SIZES[size].radius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    opacity: disabled ? 0.4 : 1,
  }),
  pressed: {
    opacity: 0.7,
  },
}));
