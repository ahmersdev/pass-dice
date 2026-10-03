import { IAppIconProps } from "./app-icon.interface";

const DEFAULT_STROKE_WIDTH = 2;

export default function AppIcon(props: IAppIconProps) {
  const { icon: Icon, size, color, strokeWidth = DEFAULT_STROKE_WIDTH } = props;

  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
