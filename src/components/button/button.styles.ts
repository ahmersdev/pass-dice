import { StyleSheet } from "react-native-unistyles";

export const buttonStyles = StyleSheet.create((theme) => ({
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.gap(1),
    backgroundColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: theme.typography.body.bold,
    fontSize: 16,
    color: theme.colors.onPrimary,
  },
}));
