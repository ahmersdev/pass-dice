import { getRandomValues } from "expo-crypto";

const UINT32_RANGE = 0x100000000;

// Thrown when the device's secure random generator is unavailable or fails.
// Callers must show an error; there is deliberately no weaker fallback.
export class SecureRandomError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("The secure random generator failed", options);
    this.name = "SecureRandomError";
  }
}

// Returns an unbiased random integer in [0, maxExclusive) from the device's
// cryptographically secure generator. Values from the unevenly sized tail of
// the 32-bit range are rejected so every result is equally likely.
export function secureRandomInt(maxExclusive: number): number {
  if (
    !Number.isInteger(maxExclusive) ||
    maxExclusive < 1 ||
    maxExclusive > UINT32_RANGE
  ) {
    throw new RangeError(`maxExclusive out of range: ${maxExclusive}`);
  }

  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
  const buffer = new Uint32Array(1);

  let value: number;
  do {
    try {
      getRandomValues(buffer);
    } catch (cause) {
      throw new SecureRandomError({ cause });
    }
    value = buffer[0];
  } while (value >= limit);

  return value % maxExclusive;
}
