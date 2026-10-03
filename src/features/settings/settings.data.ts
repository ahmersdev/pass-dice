import Globe from "lucide-react-native/icons/globe";
import { GithubIcon, LinkedinIcon } from "@/assets/icon";

export const CONTACT_LINKS = [
  {
    label: "GitHub",
    description: "@ahmersdev",
    icon: GithubIcon,
    url: "https://github.com/ahmersdev",
  },
  {
    label: "LinkedIn",
    description: "Connect with me",
    icon: LinkedinIcon,
    url: "https://linkedin.com/in/ahmersdev",
  },
  {
    label: "Portfolio",
    description: "ahmersdev.com",
    icon: Globe,
    url: "https://ahmersdev.com",
  },
] as const;
