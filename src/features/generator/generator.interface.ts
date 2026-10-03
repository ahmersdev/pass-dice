import type { IStrengthLevel } from "@/components/strength-meter/strength-meter.interface";

export type ICharacterSetKey =
  | "uppercase"
  | "lowercase"
  | "numbers"
  | "symbols";

export type ICharacterSelection = Record<ICharacterSetKey, boolean>;

export interface IPasswordStrength {
  level: IStrengthLevel;
  label: string;
}

export interface ICharacterOption {
  key: ICharacterSetKey;
  glyph: string;
  label: string;
}

export interface IUseGeneratorReturn {
  // Null when the secure random generator failed; the screen shows an error.
  password: string | null;
  regenerateCount: number;
  animatePassword: boolean;
  length: number;
  selection: ICharacterSelection;
  strength: IPasswordStrength;
  canDecreaseLength: boolean;
  canIncreaseLength: boolean;
  changeLength: (nextLength: number) => void;
  toggleCharacterSet: (key: ICharacterSetKey) => void;
  isLastSelected: (key: ICharacterSetKey) => boolean;
  regenerate: () => void;
  copyPassword: () => Promise<void>;
}
