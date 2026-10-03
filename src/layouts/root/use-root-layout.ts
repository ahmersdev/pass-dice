import { useEffect } from "react";
import { useFonts } from "expo-font";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from "@expo-google-fonts/dm-mono";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import { useUnistyles } from "react-native-unistyles";
import { resumeClipboardClear } from "@/utils/sensitive-clipboard";

SplashScreen.preventAutoHideAsync();

export default function useRootLayout() {
  const { rt } = useUnistyles();

  const [loaded, error] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    resumeClipboardClear();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return {
    isReady: loaded || !!error,
    statusBarStyle: rt.themeName === "dark" ? "light" : "dark",
  } as const;
}
