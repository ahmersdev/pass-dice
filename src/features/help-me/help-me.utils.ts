import { ErrorCode } from "expo-iap";
import { HELP_ME_PRODUCT_IDS } from "./help-me.data";

export const HELP_ME_SKUS = Object.values(HELP_ME_PRODUCT_IDS);

const HELP_ME_SKU_SET = new Set<string>(HELP_ME_SKUS);

export const isHelpMeProductId = (productId: string): boolean =>
  HELP_ME_SKU_SET.has(productId);

export const isUserCancelledError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code?: string }).code === ErrorCode.UserCancelled;
  }

  return false;
};

const UNKNOWN_ERROR_MESSAGE = "An unexpected error occurred";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string") {
      return message;
    }
  }

  return UNKNOWN_ERROR_MESSAGE;
};
