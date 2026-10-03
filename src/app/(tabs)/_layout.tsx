import "@/theme/unistyles";

import { CustomTabBar } from "@/components";
import { getTabBarBottomInset } from "@/constants/layout";
import { ROUTE_NAMES } from "@/constants/routes";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: getTabBarBottomInset(insets.bottom),
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen name={ROUTE_NAMES.GENERATOR} />
      <Tabs.Screen name={ROUTE_NAMES.HELP_ME} />
      <Tabs.Screen name={ROUTE_NAMES.SETTINGS} />
    </Tabs>
  );
}
