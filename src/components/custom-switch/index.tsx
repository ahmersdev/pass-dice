import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { ICustomSwitchProps } from "./custom-switch.interface";
import { customSwitchStyles } from "./custom-switch.styles";
import useCustomSwitch from "./use-custom-switch";

export default function CustomSwitch(props: ICustomSwitchProps) {
  const { value } = props;

  const { thumbStyle, toggleSwitch } = useCustomSwitch(props);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={toggleSwitch}
      style={customSwitchStyles.track(value)}
    >
      <Animated.View style={[customSwitchStyles.thumb, thumbStyle]} />
    </Pressable>
  );
}
