import { StyleSheet } from "react-native-unistyles";
import type { ICharacterClass } from "./password-text.interface";

export const passwordTextStyles = StyleSheet.create((theme) => {
  const classColors: Record<ICharacterClass, string> = {
    letter: theme.colors.text,
    digit: theme.colors.digit,
    symbol: theme.colors.symbol,
  };

  return {
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    char: (kind: ICharacterClass, settled: boolean) => ({
      fontFamily: theme.typography.mono.regular,
      fontSize: 24,
      lineHeight: 34,
      letterSpacing: 0.5,
      color: settled ? classColors[kind] : theme.colors.textSecondary,
    }),
  };
});
