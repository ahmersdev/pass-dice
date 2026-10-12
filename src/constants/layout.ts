export const TAB_BAR_HEIGHT = 52;
export const TAB_BAR_MARGIN = 16;

export const getTabBarBottomInset = (safeAreaBottom: number) =>
  TAB_BAR_HEIGHT + TAB_BAR_MARGIN + safeAreaBottom;

export const getTabBarStyle = (safeAreaBottom: number) => ({
  height: getTabBarBottomInset(safeAreaBottom),
  position: "absolute" as const,
});
