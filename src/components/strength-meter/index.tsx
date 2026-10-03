import { Text, View } from "react-native";
import { IStrengthMeterProps } from "./strength-meter.interface";
import { strengthMeterStyles } from "./strength-meter.styles";

const SEGMENTS = [1, 2, 3, 4];

export default function StrengthMeter(props: IStrengthMeterProps) {
  const { level, label } = props;

  return (
    <View
      accessible
      accessibilityLabel={`Password strength: ${label}`}
      style={strengthMeterStyles.container}
    >
      <View style={strengthMeterStyles.segments}>
        {SEGMENTS.map((segment) => (
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
