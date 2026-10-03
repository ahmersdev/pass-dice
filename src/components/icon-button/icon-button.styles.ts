import { StyleSheet } from "react-native-unistyles";
import type { IIconButtonSize } from "./icon-button.interface";

export const iconButtonStyles = StyleSheet.create((theme) => ({
  button: (size: IIconButtonSize, disabled: boolean) => ({
    width: size === "large" ? 52 : 44,
    height: size === "large" ? 52 : 44,
    borderRadius: size === "large" ? 14 : 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    opacity: disabled ? 0.4 : 1,
  }),
  pressed: {
    opacity: 0.7,
  },
}));
