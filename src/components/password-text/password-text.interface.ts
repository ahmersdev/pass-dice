export type ICharacterClass = "letter" | "digit" | "symbol";

export interface IPasswordTextProps {
  password: string;
  // Changes on every regenerate; a new value starts the scramble animation.
  animationKey: number;
  // Only the regenerate button animates; length and checkbox changes do not.
  animate: boolean;
}

export interface IDisplayCharacter {
  char: string;
  settled: boolean;
}

export interface IScrambleState {
  key: number;
  settled: number;
  noise: string;
}
