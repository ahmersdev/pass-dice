import { randomFillSync } from "crypto";
import { getRandomValues } from "expo-crypto";
import { SecureRandomError, secureRandomInt } from "./secure-random";

jest.mock("expo-crypto", () => ({ getRandomValues: jest.fn() }));

const mockGetRandomValues = getRandomValues as jest.Mock;

const useRealRandomness = () =>
  mockGetRandomValues.mockImplementation((buffer: Uint32Array) =>
    randomFillSync(buffer),
  );

// Makes the next draws return these exact 32-bit values.
const useScriptedDraws = (...values: number[]) => {
  values.forEach((value) =>
    mockGetRandomValues.mockImplementationOnce((buffer: Uint32Array) => {
      buffer[0] = value;
      return buffer;
    }),
  );
};

describe("secureRandomInt", () => {
  beforeEach(() => {
    mockGetRandomValues.mockReset();
    useRealRandomness();
  });

  it("returns integers within [0, max)", () => {
    for (const max of [1, 2, 7, 62, 1000]) {
      for (let i = 0; i < 200; i++) {
        const value = secureRandomInt(max);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(max);
      }
    }
  });

  it("redraws a value from the biased tail instead of using modulo", () => {
    // For max 10 the usable range ends at 4294967289; 4294967295 would favour 5.
    useScriptedDraws(0xffffffff, 7);

    expect(secureRandomInt(10)).toBe(7);
    expect(mockGetRandomValues).toHaveBeenCalledTimes(2);
  });

  it("accepts the last value below the limit and rejects the first at it", () => {
    useScriptedDraws(4294967289);
    expect(secureRandomInt(10)).toBe(9);

    useScriptedDraws(4294967290, 3);
    expect(secureRandomInt(10)).toBe(3);
  });

  it("is evenly distributed", () => {
    const counts = Array(7).fill(0);
    for (let i = 0; i < 70000; i++) {
      counts[secureRandomInt(7)]++;
    }

    // Expected 10000 each with a standard deviation of about 92.
    counts.forEach((count) => {
      expect(count).toBeGreaterThan(9000);
      expect(count).toBeLessThan(11000);
    });
  });

  it.each([0, -1, 1.5, NaN, 2 ** 32 + 1])(
    "rejects an invalid max (%p)",
    (max) => {
      expect(() => secureRandomInt(max)).toThrow(RangeError);
    },
  );

  it("throws SecureRandomError, keeping the cause, when the generator fails", () => {
    const cause = new Error("native rng unavailable");
    mockGetRandomValues.mockImplementation(() => {
      throw cause;
    });

    let thrown: unknown;
    try {
      secureRandomInt(10);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(SecureRandomError);
    expect((thrown as SecureRandomError).cause).toBe(cause);
  });

  it("never falls back to Math.random when the generator fails", () => {
    const mathRandom = jest.spyOn(Math, "random");
    mockGetRandomValues.mockImplementation(() => {
      throw new Error("native rng unavailable");
    });

    expect(() => secureRandomInt(10)).toThrow(SecureRandomError);
    expect(mathRandom).not.toHaveBeenCalled();

    mathRandom.mockRestore();
  });
});
