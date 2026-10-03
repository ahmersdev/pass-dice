import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { ISliderProps } from "./slider.interface";
import { sliderStyles } from "./slider.styles";
import useSlider from "./use-slider";

const ACCESSIBILITY_ACTIONS = [{ name: "increment" }, { name: "decrement" }];

export default function Slider(props: ISliderProps) {
  const { value, min, max, accessibilityLabel } = props;

  const { gesture, thumbLeft, fillWidth, onLayout, onAccessibilityAction } =
    useSlider(props);

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={ACCESSIBILITY_ACTIONS}
        onAccessibilityAction={onAccessibilityAction}
        onLayout={onLayout}
        style={sliderStyles.container}
      >
        <View style={sliderStyles.track}>
          <View style={sliderStyles.fill(fillWidth)} />
        </View>
        <View style={sliderStyles.thumb(thumbLeft)} />
      </View>
    </GestureDetector>
  );
}
