import { StyleSheet } from "react-native-unistyles";

export const sectionCardStyles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: theme.gap(2),
    marginBottom: theme.gap(1.5),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.gap(1),
  },
  title: {
    fontFamily: theme.typography.heading.regular,
    fontSize: 17,
    letterSpacing: 1,
    color: theme.colors.textSecondary,
  },
}));
