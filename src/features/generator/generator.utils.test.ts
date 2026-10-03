import { randomInt } from "crypto";
import { CHARACTER_SETS, LENGTH_MAX, LENGTH_MIN } from "./generator.data";
import type {
  ICharacterSetKey,
  ICharacterSelection,
} from "./generator.interface";
import {
  countSelected,
  generatePassword,
  getPasswordStrength,
  getValidFraction,
} from "./generator.utils";

const KEYS: ICharacterSetKey[] = [
  "uppercase",
  "lowercase",
  "numbers",
  "symbols",
];

const selectionFrom = (mask: number): ICharacterSelection => ({
  uppercase: !!(mask & 1),
  lowercase: !!(mask & 2),
  numbers: !!(mask & 4),
  symbols: !!(mask & 8),
});

const nodeRandomInt = (max: number) => randomInt(0, max);

const ALL = selectionFrom(15);
const NONE = selectionFrom(0);

describe("generatePassword", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])(
    "has the right length, only allowed characters and every selected type (selection %p)",
    (mask) => {
      const selection = selectionFrom(mask);
      const allowed = KEYS.filter((key) => selection[key])
        .map((key) => CHARACTER_SETS[key])
        .join("");

      for (const length of [LENGTH_MIN, 9, 16, 33, LENGTH_MAX]) {
        for (let run = 0; run < 25; run++) {
          const password = generatePassword(length, selection, nodeRandomInt);

          expect(password).toHaveLength(length);
          for (const char of password) {
            expect(allowed).toContain(char);
          }
          for (const key of KEYS.filter((k) => selection[k])) {
            expect(
              [...password].some((c) => CHARACTER_SETS[key].includes(c)),
            ).toBe(true);
          }
        }
      }
    },
  );

  it("returns an empty string when no type is selected", () => {
    expect(generatePassword(16, NONE, nodeRandomInt)).toBe("");
  });

  describe("length guard", () => {
    it("throws a RangeError when the length is shorter than the selected types", () => {
      expect(() => generatePassword(3, ALL, nodeRandomInt)).toThrow(RangeError);
      expect(() =>
        generatePassword(2, selectionFrom(7), nodeRandomInt),
      ).toThrow(RangeError);
    });

    it("allows a length equal to the number of selected types", () => {
      expect(generatePassword(4, ALL, nodeRandomInt)).toHaveLength(4);
      expect(generatePassword(1, selectionFrom(1), nodeRandomInt)).toHaveLength(
        1,
      );
    });
  });

  it("gives up with an error when the random source can never satisfy the selection", () => {
    // Always picking index 0 can only ever produce one character type.
    expect(() => generatePassword(16, ALL, () => 0)).toThrow(
      "Could not generate a password with every selected type",
    );
  });

  it("propagates a failure of the random source", () => {
    const failing = () => {
      throw new Error("rng down");
    };

    expect(() => generatePassword(16, ALL, failing)).toThrow("rng down");
  });

  it("has no positional bias (no fixed slot for any type)", () => {
    const selection = selectionFrom(7); // upper, lower, numbers
    const samples = 30000;
    const digitsAt = Array(LENGTH_MIN).fill(0);

    for (let i = 0; i < samples; i++) {
      const password = generatePassword(LENGTH_MIN, selection, nodeRandomInt);
      for (let position = 0; position < LENGTH_MIN; position++) {
        if (CHARACTER_SETS.numbers.includes(password[position])) {
          digitsAt[position]++;
        }
      }
    }

    const rates = digitsAt.map((count) => count / samples);
    expect(Math.max(...rates) - Math.min(...rates)).toBeLessThan(0.02);
  });
});

describe("getValidFraction", () => {
  it("is 1 when only one type is selected", () => {
    expect(getValidFraction(16, selectionFrom(1))).toBeCloseTo(1, 10);
  });

  it("matches known values", () => {
    expect(getValidFraction(8, ALL)).toBeCloseTo(0.4927, 3);
    expect(getValidFraction(8, selectionFrom(7))).toBeCloseTo(0.7312, 3);
    expect(getValidFraction(16, ALL)).toBeCloseTo(0.856, 3);
  });

  it("matches the measured share of uniform strings that contain every type", () => {
    const selection = selectionFrom(7);
    const sets = KEYS.filter((key) => selection[key]).map(
      (key) => CHARACTER_SETS[key],
    );
    const pool = sets.join("");
    const trials = 100000;

    let valid = 0;
    for (let i = 0; i < trials; i++) {
      let text = "";
      for (let j = 0; j < 8; j++) {
        text += pool[nodeRandomInt(pool.length)];
      }
      if (sets.every((set) => [...text].some((c) => set.includes(c)))) {
        valid++;
      }
    }

    expect(
      Math.abs(valid / trials - getValidFraction(8, selection)),
    ).toBeLessThan(0.01);
  });
});

describe("getPasswordStrength", () => {
  const strengthOf = (length: number, mask: number) =>
    getPasswordStrength(length, selectionFrom(mask));

  it.each([
    [8, 4, 1, "Weak"], // 8 digits, about 27 bits
    [8, 2, 1, "Weak"], // 8 lowercase letters, about 38 bits
    [8, 3, 2, "Fair"], // 8 upper + lower, about 46 bits
    [12, 7, 3, "Strong"], // 12 of 62 characters, about 71 bits
    [16, 7, 4, "Very strong"], // the default, about 95 bits
    [LENGTH_MAX, 4, 4, "Very strong"],
    // Numbers + symbols is a 32-character pool, so 8 characters are exactly 40
    // bits before accounting for strings that miss a type (39.93 after) and 12
    // characters are exactly 60 (59.98 after). These pin the correction.
    [8, 12, 1, "Weak"],
    [12, 12, 2, "Fair"],
  ])(
    "rates %p characters, selection %p as level %p (%s)",
    (length, mask, level, label) => {
      expect(strengthOf(length, mask)).toEqual({ level, label });
    },
  );

  it("rates an empty selection as Weak", () => {
    expect(getPasswordStrength(16, NONE).level).toBe(1);
  });
});

describe("countSelected", () => {
  it("counts the selected character types", () => {
    expect(countSelected(NONE)).toBe(0);
    expect(countSelected(selectionFrom(5))).toBe(2);
    expect(countSelected(ALL)).toBe(4);
  });
});
