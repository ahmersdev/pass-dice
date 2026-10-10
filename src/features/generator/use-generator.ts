import { useMemo, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Toast from "react-native-toast-message";
import {
  canClearClipboard,
  copySensitiveText,
  scheduleClipboardClear,
} from "@/utils/sensitive-clipboard";
import { SecureRandomError, secureRandomInt } from "@/utils/secure-random";
import {
  CLIPBOARD_CLEAR_MS,
  DEFAULT_LENGTH,
  DEFAULT_SELECTION,
  FINGERPRINT_MIN_STRENGTH_LEVEL,
  LENGTH_MAX,
  LENGTH_MIN,
} from "./generator.data";
import type {
  ICharacterSetKey,
  ICharacterSelection,
  IUseGeneratorReturn,
} from "./generator.interface";
import {
  countSelected,
  generatePassword,
  getPasswordStrength,
} from "./generator.utils";

// Returns null when the secure random generator fails. There is deliberately
// no fallback to a weaker source; the screen shows an error instead.
const createPassword = (
  length: number,
  selection: ICharacterSelection,
): string | null => {
  try {
    return generatePassword(length, selection, secureRandomInt);
  } catch (error) {
    if (error instanceof SecureRandomError) {
      return null;
    }

    throw error;
  }
};

export default function useGenerator(): IUseGeneratorReturn {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [animatePassword, setAnimatePassword] = useState(false);
  const [password, setPassword] = useState<string | null>(() =>
    createPassword(DEFAULT_LENGTH, DEFAULT_SELECTION),
  );

  const strength = useMemo(
    () => getPasswordStrength(length, selection),
    [length, selection],
  );

  const changeLength = (nextLength: number) => {
    const clamped = Math.min(Math.max(nextLength, LENGTH_MIN), LENGTH_MAX);
    if (clamped === length) {
      return;
    }

    setLength(clamped);
    setAnimatePassword(false);
    setPassword(createPassword(clamped, selection));
  };

  // The last selected type stays on, so a password can always be generated.
  const isLastSelected = (key: ICharacterSetKey) =>
    selection[key] && countSelected(selection) === 1;

  const toggleCharacterSet = (key: ICharacterSetKey) => {
    if (isLastSelected(key)) {
      return;
    }

    const nextSelection = { ...selection, [key]: !selection[key] };
    setSelection(nextSelection);
    setAnimatePassword(false);
    setPassword(createPassword(length, nextSelection));
  };

  const regenerate = () => {
    setRegenerateCount((count) => count + 1);
    setAnimatePassword(true);
    setPassword(createPassword(length, selection));
  };

  const copyPassword = async () => {
    if (password === null) {
      return;
    }

    try {
      await copySensitiveText(password);
      scheduleClipboardClear(
        password,
        CLIPBOARD_CLEAR_MS,
        strength.level >= FINGERPRINT_MIN_STRENGTH_LEVEL,
      );
      Toast.show({
        type: "success",
        text1: "Copied",
        text2: canClearClipboard
          ? "We'll try to clear it from the clipboard in 1 minute"
          : undefined,
      });
      AccessibilityInfo.announceForAccessibility("Password copied");
    } catch {
      Toast.show({ type: "error", text1: "Couldn't copy the password" });
    }
  };

  return {
    password,
    regenerateCount,
    animatePassword,
    length,
    selection,
    strength,
    canDecreaseLength: length > LENGTH_MIN,
    canIncreaseLength: length < LENGTH_MAX,
    changeLength,
    toggleCharacterSet,
    isLastSelected,
    regenerate,
    copyPassword,
  };
}
