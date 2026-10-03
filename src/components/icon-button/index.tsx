import { Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import AppIcon from "../app-icon";
import { IIconButtonProps } from "./icon-button.interface";
import { iconButtonStyles } from "./icon-button.styles";

export default function IconButton(props: IIconButtonProps) {
  const {
    icon,
    accessibilityLabel,
    onPress,
    size = "medium",
    disabled = false,
  } = props;

  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        iconButtonStyles.button(size, disabled),
        pressed && iconButtonStyles.pressed,
      ]}
    >
      <AppIcon icon={icon} size={20} color={theme.colors.text} />
    </Pressable>
  );
}
