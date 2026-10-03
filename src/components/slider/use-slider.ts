import { useState } from "react";
import type { AccessibilityActionEvent, LayoutChangeEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { ISliderProps } from "./slider.interface";
import { SLIDER_THUMB_SIZE } from "./slider.styles";

export default function useSlider(props: ISliderProps) {
  const { value, min, max, onChange } = props;

  const [trackWidth, setTrackWidth] = useState(0);

  const usableWidth = Math.max(trackWidth - SLIDER_THUMB_SIZE, 0);
  const thumbLeft = ((value - min) / (max - min)) * usableWidth;
  const fillWidth = thumbLeft + SLIDER_THUMB_SIZE / 2;

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const updateFromPosition = (x: number) => {
    if (usableWidth === 0) {
      return;
    }

    const thumbX = x - SLIDER_THUMB_SIZE / 2;
    const clamped = Math.min(Math.max(thumbX, 0), usableWidth);
    onChange(Math.round(min + (clamped / usableWidth) * (max - min)));
  };

  // Horizontal drags move the thumb; vertical drags fall through to the page scroll.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onUpdate((event) => updateFromPosition(event.x));

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((event) => updateFromPosition(event.x));

  const gesture = Gesture.Race(pan, tap);

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === "increment") {
      onChange(Math.min(value + 1, max));
    } else if (event.nativeEvent.actionName === "decrement") {
      onChange(Math.max(value - 1, min));
    }
  };

  return { gesture, thumbLeft, fillWidth, onLayout, onAccessibilityAction };
}
