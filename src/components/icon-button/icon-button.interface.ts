import type { IAppIcon } from "@/components/app-icon/app-icon.interface";

export type IIconButtonSize = "medium" | "large";

export interface IIconButtonProps {
  icon: IAppIcon;
  accessibilityLabel: string;
  onPress: () => void;
  size?: IIconButtonSize;
  disabled?: boolean;
}
