import type { ReactNode } from "react";
import type { IScreenTitleProps } from "@/components/screen-title/screen-title.interface";

export interface ITabsLayoutProps {
  children?: ReactNode;
  titleProps: IScreenTitleProps;
}
