import { StyleSheet } from "react-native-unistyles";

const SLIDER_HIT_HEIGHT = 44;
export const SLIDER_THUMB_SIZE = 26;

export const sliderStyles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    height: SLIDER_HIT_HEIGHT,
    justifyContent: "center",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.background,
  },
  fill: (width: number) => ({
    width,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  }),
  thumb: (left: number) => ({
    position: "absolute",
    left,
    top: (SLIDER_HIT_HEIGHT - SLIDER_THUMB_SIZE) / 2,
    width: SLIDER_THUMB_SIZE,
    height: SLIDER_THUMB_SIZE,
    borderRadius: SLIDER_THUMB_SIZE / 2,
    backgroundColor: theme.colors.text,
    elevation: 3,
  }),
}));
