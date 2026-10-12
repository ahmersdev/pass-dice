import { Text, View } from "react-native";
import { STRENGTH_SEGMENTS } from "./strength-meter.data";
import { IStrengthMeterProps } from "./strength-meter.interface";
import { strengthMeterStyles } from "./strength-meter.styles";

export default function StrengthMeter(props: IStrengthMeterProps) {
  const { level, label } = props;

  return (
    <View
      accessible
      accessibilityLabel={`Password strength: ${label}`}
      style={strengthMeterStyles.container}
    >
      <View style={strengthMeterStyles.segments}>
        {STRENGTH_SEGMENTS.map((segment) => (
          <View
            key={segment}
            style={strengthMeterStyles.segment(level, segment <= level)}
          />
        ))}
      </View>
      <Text style={strengthMeterStyles.label}>{label}</Text>
    </View>
  );
}
