import type { IAppIcon } from "@/components/app-icon/app-icon.interface";

export interface IButtonProps {
  label: string;
  icon: IAppIcon;
  onPress: () => void;
  disabled?: boolean;
}
