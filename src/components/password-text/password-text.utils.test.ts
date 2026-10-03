import { getCharacterClass, getNoise, getTickMs } from "./password-text.utils";

describe("getCharacterClass", () => {
  it.each([
    ["a", "letter"],
    ["Z", "letter"],
    ["0", "digit"],
    ["9", "digit"],
    ["#", "symbol"],
    ["&", "symbol"],
    ["/", "symbol"],
  ])("classifies %p as %s", (char, expected) => {
    expect(getCharacterClass(char)).toBe(expected);
  });
});

describe("getTickMs", () => {
  it("uses 45 ms per character for passwords up to 17 characters", () => {
    expect(getTickMs(8)).toBe(45);
    expect(getTickMs(16)).toBe(45);
  });

  it("speeds up long passwords so the whole animation stays within 800 ms", () => {
    for (const length of [18, 32, 64]) {
      expect(getTickMs(length)).toBeLessThan(45);
      expect(getTickMs(length) * length).toBeLessThanOrEqual(800);
    }
  });

  it("copes with an empty password", () => {
    expect(getTickMs(0)).toBe(45);
  });
});

describe("getNoise", () => {
  it("returns the requested number of letters and digits", () => {
    for (const length of [0, 1, 16, 64]) {
      const noise = getNoise(length);

      expect(noise).toHaveLength(length);
      expect(noise).toMatch(/^[A-Za-z0-9]*$/);
    }
  });
});
