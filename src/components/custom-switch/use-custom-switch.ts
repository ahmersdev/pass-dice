import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ICustomSwitchProps } from "./custom-switch.interface";

const TRAVEL = 18;

export default function useCustomSwitch(props: ICustomSwitchProps) {
  const { value, onValueChange } = props;

  const offset = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    offset.value = withTiming(value ? TRAVEL : 0, { duration: 180 });
  }, [value, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const toggleSwitch = () => onValueChange(!value);

  return { thumbStyle, toggleSwitch };
}
