import { randomInt } from "crypto";
import { act, renderHook } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { SecureRandomError, secureRandomInt } from "@/utils/secure-random";
import {
  copySensitiveText,
  scheduleClipboardClear,
} from "@/utils/sensitive-clipboard";
import {
  CLIPBOARD_CLEAR_MS,
  DEFAULT_LENGTH,
  LENGTH_MAX,
  LENGTH_MIN,
} from "./generator.data";
import useGenerator from "./use-generator";

jest.mock("@/utils/secure-random", () => ({
  ...jest.requireActual("@/utils/secure-random"),
  secureRandomInt: jest.fn(),
}));
jest.mock("@/utils/sensitive-clipboard", () => ({
  canClearClipboard: true,
  copySensitiveText: jest.fn(),
  scheduleClipboardClear: jest.fn(),
}));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));

const mockSecureRandomInt = secureRandomInt as jest.Mock;
const mockCopy = copySensitiveText as jest.Mock;
const mockSchedule = scheduleClipboardClear as jest.Mock;
const mockToastShow = Toast.show as jest.Mock;

const rngWorks = () =>
  mockSecureRandomInt.mockImplementation((max: number) => randomInt(0, max));
const rngFails = () =>
  mockSecureRandomInt.mockImplementation(() => {
    throw new SecureRandomError();
  });

const setup = () => renderHook(useGenerator);

describe("useGenerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rngWorks();
    mockCopy.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("starts with a 16-character password and the default character types", async () => {
      const { result } = await setup();

      expect(result.current.length).toBe(DEFAULT_LENGTH);
      expect(result.current.password).toHaveLength(DEFAULT_LENGTH);
      expect(result.current.selection).toEqual({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
      });
      expect(result.current.animatePassword).toBe(false);
      expect(result.current.regenerateCount).toBe(0);
      expect(result.current.strength).toEqual({
        level: 4,
        label: "Very strong",
      });
    });
  });

  describe("changeLength", () => {
    it("generates a password of the new length", async () => {
      const { result } = await setup();

      await act(async () => result.current.changeLength(24));

      expect(result.current.length).toBe(24);
      expect(result.current.password).toHaveLength(24);
    });

    it("keeps the length within the limits", async () => {
      const { result } = await setup();

      await act(async () => result.current.changeLength(1));
      expect(result.current.length).toBe(LENGTH_MIN);
      expect(result.current.canDecreaseLength).toBe(false);

      await act(async () => result.current.changeLength(500));
      expect(result.current.length).toBe(LENGTH_MAX);
      expect(result.current.canIncreaseLength).toBe(false);
    });

    it("does not regenerate when the length is unchanged", async () => {
      const { result } = await setup();
      const before = result.current.password;
      mockSecureRandomInt.mockClear();

      await act(async () => result.current.changeLength(DEFAULT_LENGTH));

      expect(result.current.password).toBe(before);
      expect(mockSecureRandomInt).not.toHaveBeenCalled();
    });
  });

  describe("toggleCharacterSet", () => {
    it("regenerates with the new selection", async () => {
      const { result } = await setup();

      await act(async () => result.current.toggleCharacterSet("symbols"));

      expect(result.current.selection.symbols).toBe(true);
      expect(result.current.password).toHaveLength(DEFAULT_LENGTH);
    });

    it("never lets the last selected type be unticked", async () => {
      const { result } = await setup();
      await act(async () => result.current.toggleCharacterSet("uppercase"));
      await act(async () => result.current.toggleCharacterSet("lowercase"));

      expect(result.current.selection).toEqual({
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
      });
      expect(result.current.isLastSelected("numbers")).toBe(true);
      expect(result.current.isLastSelected("symbols")).toBe(false);

      const before = result.current.password;
      await act(async () => result.current.toggleCharacterSet("numbers"));

      expect(result.current.selection.numbers).toBe(true);
      expect(result.current.password).toBe(before);
    });
  });

  describe("regenerate", () => {
    it("makes a new password and turns the animation on", async () => {
      const { result } = await setup();

      await act(async () => result.current.regenerate());

      expect(result.current.regenerateCount).toBe(1);
      expect(result.current.animatePassword).toBe(true);
    });

    it("turns the animation off again for length and checkbox changes", async () => {
      const { result } = await setup();
      await act(async () => result.current.regenerate());

      await act(async () => result.current.changeLength(20));
      expect(result.current.animatePassword).toBe(false);

      await act(async () => result.current.regenerate());
      expect(result.current.animatePassword).toBe(true);

      await act(async () => result.current.toggleCharacterSet("symbols"));
      expect(result.current.animatePassword).toBe(false);
      expect(result.current.regenerateCount).toBe(2);
    });
  });

  describe("when the secure random generator fails", () => {
    it("has no password at startup, and never falls back to Math.random", async () => {
      const mathRandom = jest.spyOn(Math, "random");
      rngFails();

      const { result } = await setup();

      expect(result.current.password).toBeNull();
      expect(mathRandom).not.toHaveBeenCalled();
      mathRandom.mockRestore();
    });

    it("shows no password after a failed regenerate, then recovers when it works again", async () => {
      const { result } = await setup();
      expect(result.current.password).not.toBeNull();

      rngFails();
      await act(async () => result.current.regenerate());
      expect(result.current.password).toBeNull();

      rngWorks();
      await act(async () => result.current.regenerate());
      expect(result.current.password).toHaveLength(DEFAULT_LENGTH);
    });

    it("does not copy anything", async () => {
      rngFails();
      const { result } = await setup();

      await act(async () => result.current.copyPassword());

      expect(mockCopy).not.toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
      expect(mockToastShow).not.toHaveBeenCalled();
    });

    it("does not hide programming errors behind the generator error state", async () => {
      mockSecureRandomInt.mockImplementation(() => {
        throw new TypeError("a real bug");
      });

      await expect(setup()).rejects.toThrow("a real bug");
    });
  });

  describe("copyPassword", () => {
    it("copies the shown password, schedules the clear and tells the user", async () => {
      const { result } = await setup();
      const password = result.current.password!;

      await act(async () => result.current.copyPassword());

      expect(mockCopy).toHaveBeenCalledWith(password);
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Copied",
          text2: "We'll try to clear it from the clipboard in 1 minute",
        }),
      );
    });

    it("also stores a fingerprint for Very strong passwords", async () => {
      const { result } = await setup(); // the default is Very strong
      const password = result.current.password!;

      await act(async () => result.current.copyPassword());

      expect(mockSchedule).toHaveBeenCalledWith(
        password,
        CLIPBOARD_CLEAR_MS,
        true,
      );
    });

    it("stores no fingerprint for weaker passwords", async () => {
      const { result } = await setup();
      await act(async () => result.current.toggleCharacterSet("uppercase"));
      await act(async () => result.current.toggleCharacterSet("lowercase"));
      await act(async () => result.current.changeLength(LENGTH_MIN));
      expect(result.current.strength.level).toBe(1); // 8 digits
      const password = result.current.password!;

      await act(async () => result.current.copyPassword());

      expect(mockSchedule).toHaveBeenCalledWith(
        password,
        CLIPBOARD_CLEAR_MS,
        false,
      );
    });

    it("shows an error toast when copying fails and does not schedule a clear", async () => {
      mockCopy.mockRejectedValue(new Error("clipboard unavailable"));
      const { result } = await setup();

      await act(async () => result.current.copyPassword());

      expect(mockSchedule).not.toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith({
        type: "error",
        text1: "Couldn't copy the password",
      });
    });
  });
});
