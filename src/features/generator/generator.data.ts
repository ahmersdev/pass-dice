import type {
  ICharacterSetKey,
  ICharacterOption,
  ICharacterSelection,
  IPasswordStrength,
} from "./generator.interface";

export const LENGTH_MIN = 8;
export const LENGTH_MAX = 64;
export const DEFAULT_LENGTH = 16;

// How long a copied password stays on the clipboard (where clearing is supported).
export const CLIPBOARD_CLEAR_MS = 60_000;

// Passwords at this strength level or above also get a salted hash stored, so
// the clipboard clear can finish after the app is killed. Weaker passwords are
// not stored in any form, because a hash of them could be guessed back.
export const FINGERPRINT_MIN_STRENGTH_LEVEL = 4;

export const GENERATION_ERROR_MESSAGE =
  "Couldn't generate a secure password. Please try again.";

export const DEFAULT_SELECTION: ICharacterSelection = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
};

export const CHARACTER_SETS: Record<ICharacterSetKey, string> = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}<>?/",
};

export const CHARACTER_OPTIONS: ICharacterOption[] = [
  { key: "uppercase", glyph: "ABC", label: "Uppercase" },
  { key: "lowercase", glyph: "abc", label: "Lowercase" },
  { key: "numbers", glyph: "123", label: "Numbers" },
  { key: "symbols", glyph: "#$&", label: "Symbols" },
];

// Entropy thresholds in bits. A result below `maxBits` gets that level.
export const STRENGTH_STEPS: {
  maxBits: number;
  strength: IPasswordStrength;
}[] = [
  { maxBits: 40, strength: { level: 1, label: "Weak" } },
  { maxBits: 60, strength: { level: 2, label: "Fair" } },
  { maxBits: 80, strength: { level: 3, label: "Strong" } },
];

export const STRENGTH_MAX: IPasswordStrength = {
  level: 4,
  label: "Very strong",
};
