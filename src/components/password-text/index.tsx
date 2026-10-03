import { Text, View } from "react-native";
import { IPasswordTextProps } from "./password-text.interface";
import { passwordTextStyles } from "./password-text.styles";
import { getCharacterClass } from "./password-text.utils";
import usePasswordText from "./use-password-text";

export default function PasswordText(props: IPasswordTextProps) {
  const { password } = props;

  const { characters } = usePasswordText(props);

  return (
    <View
      accessible
      accessibilityLabel={`Password: ${password}`}
      style={passwordTextStyles.container}
    >
      {characters.map(({ char, settled }, index) => (
        <Text
          key={index}
          accessible={false}
          style={passwordTextStyles.char(getCharacterClass(char), settled)}
        >
          {char}
        </Text>
      ))}
    </View>
  );
}
