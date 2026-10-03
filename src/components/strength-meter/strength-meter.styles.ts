import { StyleSheet } from "react-native-unistyles";
import type { IStrengthLevel } from "./strength-meter.interface";

export const strengthMeterStyles = StyleSheet.create((theme) => {
  const levelColors = {
    1: theme.colors.strengthWeak,
    2: theme.colors.strengthFair,
    3: theme.colors.strengthStrong,
    4: theme.colors.strengthVeryStrong,
  };

  return {
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.gap(1.5),
      marginTop: theme.gap(1.5),
    },
    segments: {
      flex: 1,
      flexDirection: "row",
      gap: 5,
    },
    segment: (level: IStrengthLevel, filled: boolean) => ({
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: filled ? levelColors[level] : theme.colors.background,
    }),
    label: {
      fontFamily: theme.typography.body.bold,
      fontSize: 13,
      color: theme.colors.text,
    },
  };
});
