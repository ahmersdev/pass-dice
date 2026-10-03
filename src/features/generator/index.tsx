import { Text, View } from "react-native";
import Copy from "lucide-react-native/icons/copy";
import Minus from "lucide-react-native/icons/minus";
import Plus from "lucide-react-native/icons/plus";
import RefreshCw from "lucide-react-native/icons/refresh-cw";
import {
  Button,
  CheckboxRow,
  IconButton,
  PasswordText,
  SectionCard,
  Slider,
  StrengthMeter,
} from "@/components";
import { PAGE_TITLES } from "@/constants/routes";
import { TabsLayout } from "@/layouts";
import {
  CHARACTER_OPTIONS,
  GENERATION_ERROR_MESSAGE,
  LENGTH_MAX,
  LENGTH_MIN,
} from "./generator.data";
import { generatorStyles } from "./generator.styles";
import useGenerator from "./use-generator";

export default function Generator() {
  const {
    password,
    regenerateCount,
    animatePassword,
    length,
    selection,
    strength,
    canDecreaseLength,
    canIncreaseLength,
    changeLength,
    toggleCharacterSet,
    isLastSelected,
    regenerate,
    copyPassword,
  } = useGenerator();

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.GENERATOR }}>
      <SectionCard title="YOUR PASSWORD">
        {password === null ? (
          <Text accessibilityRole="alert" style={generatorStyles.error}>
            {GENERATION_ERROR_MESSAGE}
          </Text>
        ) : (
          <>
            <PasswordText
              password={password}
              animationKey={regenerateCount}
              animate={animatePassword}
            />
            <StrengthMeter level={strength.level} label={strength.label} />
          </>
        )}
        <View style={generatorStyles.actions}>
          <Button
            label="Copy"
            icon={Copy}
            disabled={password === null}
            onPress={copyPassword}
          />
          <IconButton
            icon={RefreshCw}
            size="large"
            accessibilityLabel="Generate a new password"
            onPress={regenerate}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="LENGTH"
        trailing={<Text style={generatorStyles.lengthValue}>{length}</Text>}
      >
        <View style={generatorStyles.lengthRow}>
          <IconButton
            icon={Minus}
            accessibilityLabel="Decrease length"
            disabled={!canDecreaseLength}
            onPress={() => changeLength(length - 1)}
          />
          <Slider
            value={length}
            min={LENGTH_MIN}
            max={LENGTH_MAX}
            onChange={changeLength}
            accessibilityLabel="Password length"
          />
          <IconButton
            icon={Plus}
            accessibilityLabel="Increase length"
            disabled={!canIncreaseLength}
            onPress={() => changeLength(length + 1)}
          />
        </View>
      </SectionCard>

      <SectionCard title="CHARACTERS">
        <View style={generatorStyles.options}>
          {CHARACTER_OPTIONS.map((option) => (
            <CheckboxRow
              key={option.key}
              glyph={option.glyph}
              label={option.label}
              checked={selection[option.key]}
              hint={
                isLastSelected(option.key)
                  ? "At least one character type must stay selected"
                  : undefined
              }
              onPress={() => toggleCharacterSet(option.key)}
            />
          ))}
        </View>
      </SectionCard>
    </TabsLayout>
  );
}
