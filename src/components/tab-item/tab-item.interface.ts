import type { SharedValue } from "react-native-reanimated";
import type { IAppIcon } from "@/components/app-icon/app-icon.interface";

export interface ITabItemProps {
  icon: IAppIcon;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  pillX: SharedValue<number>;
  tabIndex: number;
  tabWidth: number;
}
