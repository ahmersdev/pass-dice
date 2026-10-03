import { Pressable, Text, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import AppIcon from "../app-icon";
import Check from "lucide-react-native/icons/check";
import { ICheckboxRowProps } from "./checkbox-row.interface";
import { checkboxRowStyles } from "./checkbox-row.styles";

export default function CheckboxRow(props: ICheckboxRowProps) {
  const { glyph, label, checked, onPress, hint } = props;

  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [
        checkboxRowStyles.row,
        pressed && checkboxRowStyles.pressed,
      ]}
    >
      <View style={checkboxRowStyles.box(checked)}>
        {checked && (
          <AppIcon
            icon={Check}
            size={14}
            color={theme.colors.onPrimary}
            strokeWidth={3}
          />
        )}
      </View>
      <Text style={checkboxRowStyles.glyph}>{glyph}</Text>
      <Text style={checkboxRowStyles.label}>{label}</Text>
    </Pressable>
  );
}
