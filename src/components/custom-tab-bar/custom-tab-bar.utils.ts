import HeartHandshake from "lucide-react-native/icons/heart-handshake";
import Dices from "lucide-react-native/icons/dices";
import Settings from "lucide-react-native/icons/settings";
import { IAppIcon } from "@/components/app-icon/app-icon.interface";
import { PAGE_TITLES, ROUTE_NAMES } from "@/constants/routes";

export const TAB_CONFIG: Record<string, { icon: IAppIcon; label: string }> = {
  [ROUTE_NAMES.GENERATOR]: { icon: Dices, label: PAGE_TITLES.GENERATOR },
  [ROUTE_NAMES.HELP_ME]: { icon: HeartHandshake, label: PAGE_TITLES.HELP_ME },
  [ROUTE_NAMES.SETTINGS]: { icon: Settings, label: PAGE_TITLES.SETTINGS },
};
