import type { ICharacterClass } from "./password-text.interface";

const NOISE_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MAX_TICK_MS = 45;
const MAX_TOTAL_MS = 800;

export const getCharacterClass = (char: string): ICharacterClass => {
  if (/[0-9]/.test(char)) {
    return "digit";
  }

  return /[A-Za-z]/.test(char) ? "letter" : "symbol";
};

// Time between one more character settling. Long passwords speed up so the
// whole animation stays within about 0.8 seconds.
export const getTickMs = (length: number): number =>
  Math.min(MAX_TICK_MS, MAX_TOTAL_MS / Math.max(length, 1));

// Random look-alike characters shown for positions that have not settled yet.
// This is decoration only; the real password never comes from here.
export const getNoise = (length: number): string => {
  let noise = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * NOISE_CHARACTERS.length);
    noise += NOISE_CHARACTERS[index];
  }
  return noise;
};
