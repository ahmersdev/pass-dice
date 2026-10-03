import { StyleSheet } from "react-native-unistyles";

export const checkboxRowStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.5),
    minHeight: 46,
    paddingHorizontal: theme.gap(1.75),
    borderRadius: 14,
    backgroundColor: theme.colors.background,
  },
  pressed: {
    opacity: 0.8,
  },
  box: (checked: boolean) => ({
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: checked ? theme.colors.primary : theme.colors.textSecondary,
    backgroundColor: checked ? theme.colors.primary : "transparent",
  }),
  glyph: {
    width: 54,
    fontFamily: theme.typography.mono.medium,
    fontSize: 20,
    letterSpacing: 1,
    color: theme.colors.text,
  },
  label: {
    fontFamily: theme.typography.body.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
}));
