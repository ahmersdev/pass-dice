import Coffee from "lucide-react-native/icons/coffee";
import Hamburger from "lucide-react-native/icons/hamburger";
import Rocket from "lucide-react-native/icons/rocket";

export const HELP_ME_PRODUCT_IDS = {
  COFFEE: "tip_coffee",
  LUNCH: "tip_lunch",
  FEATURE: "tip_feature",
} as const;

export const HELP_ME_PRODUCTS = [
  {
    id: HELP_ME_PRODUCT_IDS.COFFEE,
    label: "Buy me a coffee",
    description: "A small thank you ☕",
    icon: Coffee,
    successMessage: "Thank you for the coffee! ☕",
  },
  {
    id: HELP_ME_PRODUCT_IDS.LUNCH,
    label: "Buy me lunch",
    description: "A generous treat 🍔",
    icon: Hamburger,
    successMessage: "Thank you for lunch! 🍔",
  },
  {
    id: HELP_ME_PRODUCT_IDS.FEATURE,
    label: "Sponsor a feature",
    description: "Help build the next big thing 🚀",
    icon: Rocket,
    successMessage: "Thank you for sponsoring a feature! 🚀",
  },
] as const;
