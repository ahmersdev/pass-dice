import { ErrorCode } from "expo-iap";
import {
  getErrorMessage,
  HELP_ME_SKUS,
  isHelpMeProductId,
  isUserCancelledError,
} from "./help-me.utils";

jest.mock("expo-iap", () => ({
  ErrorCode: { UserCancelled: "user-cancelled", NetworkError: "network-error" },
}));
jest.mock("lucide-react-native/icons/coffee", () => "Coffee");
jest.mock("lucide-react-native/icons/hamburger", () => "Hamburger");
jest.mock("lucide-react-native/icons/rocket", () => "Rocket");

describe("help-me utils", () => {
  it("lists every tip product as a sku", () => {
    expect(HELP_ME_SKUS).toEqual(["tip_coffee", "tip_lunch", "tip_feature"]);
  });

  it("recognises only the tip products", () => {
    expect(isHelpMeProductId("tip_coffee")).toBe(true);
    expect(isHelpMeProductId("premium_upgrade")).toBe(false);
  });

  it("treats a user-cancelled error code as a cancellation", () => {
    expect(isUserCancelledError({ code: ErrorCode.UserCancelled })).toBe(true);
    expect(isUserCancelledError({ code: ErrorCode.NetworkError })).toBe(false);
    expect(isUserCancelledError(new Error("boom"))).toBe(false);
    expect(isUserCancelledError(null)).toBe(false);
  });

  it("reads a message from errors, plain objects, and falls back otherwise", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage({ message: "plain" })).toBe("plain");
    expect(getErrorMessage({ message: 5 })).toBe("An unexpected error occurred");
    expect(getErrorMessage("nope")).toBe("An unexpected error occurred");
  });
});
