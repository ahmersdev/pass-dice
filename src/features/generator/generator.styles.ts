import { StyleSheet } from "react-native-unistyles";

export const generatorStyles = StyleSheet.create((theme) => ({
  actions: {
    flexDirection: "row",
    gap: theme.gap(1.25),
    marginTop: theme.gap(2),
  },
  error: {
    fontFamily: theme.typography.body.medium,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.strengthWeak,
  },
  lengthValue: {
    fontFamily: theme.typography.heading.regular,
    fontSize: 30,
    color: theme.colors.text,
  },
  lengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1),
  },
  options: {
    gap: 6,
  },
}));
