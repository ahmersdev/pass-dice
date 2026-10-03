import { ITabItemProps } from "./tab-item.interface";
import { Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import AppIcon from "../app-icon";
import Animated from "react-native-reanimated";
import useTabItem from "./use-tab-item";
import { tabItemStyles } from "./tab-item.styles";

export default function TabItem(props: ITabItemProps) {
  const { icon, label, isFocused, onPress } = props;

  const { theme } = useUnistyles();
  const { labelWrapperStyle } = useTabItem(props);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "transparent" }}
      style={tabItemStyles.container}
    >
      <AppIcon
        icon={icon}
        size={20}
        color={isFocused ? theme.colors.text : theme.colors.textSecondary}
      />
      {/* Animated wrapper collapses width to 0 so icon stays centered when inactive */}
      <Animated.View style={[tabItemStyles.labelWrapper, labelWrapperStyle]}>
        <Animated.Text numberOfLines={1} style={tabItemStyles.text}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
