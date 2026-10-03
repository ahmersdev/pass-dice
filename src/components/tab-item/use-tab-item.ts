import { ITabItemProps } from "./tab-item.interface";
import {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

export default function useTabItem(props: ITabItemProps) {
  const { pillX, tabIndex, tabWidth } = props;

  const labelWrapperStyle = useAnimatedStyle(() => {
    if (tabWidth === 0) return { opacity: 0, maxWidth: 0 };
    const targetX = tabIndex * tabWidth;
    const diff = Math.abs(pillX.value - targetX);
    const opacity = interpolate(
      diff,
      [0, tabWidth * 0.25],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const maxWidth = interpolate(
      diff,
      [0, tabWidth * 0.25],
      [120, 0],
      Extrapolation.CLAMP,
    );
    return { opacity, maxWidth };
  });

  return {
    labelWrapperStyle,
  };
}
