import { Pressable, Text } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import AppIcon from "../app-icon";
import { IButtonProps } from "./button.interface";
import { buttonStyles } from "./button.styles";

export default function Button(props: IButtonProps) {
  const { label, icon, onPress, disabled = false } = props;

  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyles.button,
        pressed && buttonStyles.pressed,
        disabled && buttonStyles.disabled,
      ]}
    >
      <AppIcon icon={icon} size={20} color={theme.colors.onPrimary} />
      <Text style={buttonStyles.label}>{label}</Text>
    </Pressable>
  );
}
