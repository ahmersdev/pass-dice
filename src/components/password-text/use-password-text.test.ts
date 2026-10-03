import { act, renderHook } from "@testing-library/react-native";
import { useReducedMotion } from "react-native-reanimated";
import usePasswordText from "./use-password-text";
import type { IPasswordTextProps } from "./password-text.interface";

jest.mock("react-native-reanimated", () => ({ useReducedMotion: jest.fn() }));

const mockUseReducedMotion = useReducedMotion as jest.Mock;

const PASSWORD = "k7Q#mV2&xR9d$Tw4";

const settledFlags = (characters: { settled: boolean }[]) =>
  characters.map((character) => character.settled);

describe("usePasswordText", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("shows the password as is when it is not animating", async () => {
    const { result } = await renderHook(usePasswordText, {
      initialProps: { password: PASSWORD, animationKey: 0, animate: false },
    });

    expect(result.current.characters.map((c) => c.char).join("")).toBe(
      PASSWORD,
    );
    expect(settledFlags(result.current.characters).every(Boolean)).toBe(true);
  });

  it("does not animate when the animation flag is off, even for a new key", async () => {
    const { result } = await renderHook(usePasswordText, {
      initialProps: { password: PASSWORD, animationKey: 3, animate: false },
    });

    expect(settledFlags(result.current.characters).every(Boolean)).toBe(true);
  });

  it("settles one character at a time from the left, then shows the real password", async () => {
    const { result } = await renderHook(usePasswordText, {
      initialProps: { password: PASSWORD, animationKey: 1, animate: true },
    });

    // Nothing has settled yet and the real password is not on screen.
    expect(settledFlags(result.current.characters).some(Boolean)).toBe(false);
    expect(result.current.characters.map((c) => c.char).join("")).not.toBe(
      PASSWORD,
    );

    // 45 ms per character for a 16-character password.
    await act(async () => {
      jest.advanceTimersByTime(45 * 3);
    });
    const afterThree = settledFlags(result.current.characters);
    expect(afterThree.slice(0, 3)).toEqual([true, true, true]);
    expect(afterThree.slice(3).some(Boolean)).toBe(false);
    expect(
      result.current.characters
        .slice(0, 3)
        .map((c) => c.char)
        .join(""),
    ).toBe(PASSWORD.slice(0, 3));

    await act(async () => {
      jest.advanceTimersByTime(45 * 20);
    });
    expect(settledFlags(result.current.characters).every(Boolean)).toBe(true);
    expect(result.current.characters.map((c) => c.char).join("")).toBe(
      PASSWORD,
    );
  });

  it("shows the password immediately when the phone has reduce motion on", async () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { result } = await renderHook(usePasswordText, {
      initialProps: { password: PASSWORD, animationKey: 1, animate: true },
    });

    expect(settledFlags(result.current.characters).every(Boolean)).toBe(true);
    expect(result.current.characters.map((c) => c.char).join("")).toBe(
      PASSWORD,
    );
  });

  it("starts over for a new animation key", async () => {
    const { result, rerender } = await renderHook(usePasswordText, {
      initialProps: { password: PASSWORD, animationKey: 1, animate: true },
    });
    await act(async () => {
      jest.advanceTimersByTime(45 * 20);
    });
    expect(settledFlags(result.current.characters).every(Boolean)).toBe(true);

    const next: IPasswordTextProps = {
      password: "Zz9!Zz9!Zz9!Zz9!",
      animationKey: 2,
      animate: true,
    };
    await rerender(next);

    expect(settledFlags(result.current.characters).some(Boolean)).toBe(false);
  });

  it("shows a changed password instantly when the change is not a regenerate", async () => {
    const { result, rerender } = await renderHook(usePasswordText, {
      initialProps: { password: PASSWORD, animationKey: 1, animate: true },
    });
    await act(async () => {
      jest.advanceTimersByTime(45 * 20);
    });

    await rerender({
      password: "newer-by-slider!!",
      animationKey: 1,
      animate: false,
    });

    expect(result.current.characters.map((c) => c.char).join("")).toBe(
      "newer-by-slider!!",
    );
    expect(settledFlags(result.current.characters).every(Boolean)).toBe(true);
  });
});
