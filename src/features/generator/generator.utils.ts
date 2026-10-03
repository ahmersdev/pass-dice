import {
  CHARACTER_OPTIONS,
  CHARACTER_SETS,
  STRENGTH_MAX,
  STRENGTH_STEPS,
} from "./generator.data";
import type {
  ICharacterSelection,
  IPasswordStrength,
} from "./generator.interface";

const MAX_ATTEMPTS = 1000;

const containsAny = (text: string, chars: string): boolean =>
  Array.from(text).some((char) => chars.includes(char));

const getEnabledSets = (selection: ICharacterSelection): string[] =>
  CHARACTER_OPTIONS.filter((option) => selection[option.key]).map(
    (option) => CHARACTER_SETS[option.key],
  );

export const countSelected = (selection: ICharacterSelection): number =>
  getEnabledSets(selection).length;

// Draws every character uniformly from the combined pool and redraws until
// each enabled set is represented. That makes every valid password equally
// likely, with no forced positions. `randomInt(max)` must return an unbiased
// integer in [0, max).
export const generatePassword = (
  length: number,
  selection: ICharacterSelection,
  randomInt: (maxExclusive: number) => number,
): string => {
  const enabledSets = getEnabledSets(selection);
  if (enabledSets.length === 0) {
    return "";
  }

  if (length < enabledSets.length) {
    throw new RangeError(
      `length ${length} is shorter than the ${enabledSets.length} selected character types`,
    );
  }

  const pool = enabledSets.join("");

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let password = "";
    for (let i = 0; i < length; i++) {
      password += pool[randomInt(pool.length)];
    }

    if (enabledSets.every((set) => containsAny(password, set))) {
      return password;
    }
  }

  throw new Error("Could not generate a password with every selected type");
};

// Chance that a uniformly random string over the pool contains every enabled
// set at least once (inclusion-exclusion over the sets that could be missing).
export const getValidFraction = (
  length: number,
  selection: ICharacterSelection,
): number => {
  const sizes = getEnabledSets(selection).map((set) => set.length);
  const poolSize = sizes.reduce((sum, size) => sum + size, 0);

  let fraction = 0;
  for (let mask = 0; mask < 1 << sizes.length; mask++) {
    let missing = 0;
    let missingCount = 0;
    sizes.forEach((size, index) => {
      if (mask & (1 << index)) {
        missing += size;
        missingCount += 1;
      }
    });
    const sign = missingCount % 2 === 0 ? 1 : -1;
    fraction += sign * ((poolSize - missing) / poolSize) ** length;
  }

  return fraction;
};

// Estimates strength as log2 of the number of possible passwords: length *
// log2(pool size), reduced by the strings that miss an enabled type.
export const getPasswordStrength = (
  length: number,
  selection: ICharacterSelection,
): IPasswordStrength => {
  const poolSize = getEnabledSets(selection).join("").length;
  const bits =
    poolSize > 0
      ? length * Math.log2(poolSize) +
        Math.log2(getValidFraction(length, selection))
      : 0;

  const step = STRENGTH_STEPS.find((candidate) => bits < candidate.maxBits);
  return step ? step.strength : STRENGTH_MAX;
};
