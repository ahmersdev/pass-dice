import { Platform } from "react-native";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { ErrorCode, getAvailablePurchases, useIAP } from "expo-iap";
import Toast from "react-native-toast-message";
import useHelpMe from "./use-help-me";

jest.mock("expo-iap", () => ({
  ErrorCode: { UserCancelled: "user-cancelled", NetworkError: "network-error" },
  getAvailablePurchases: jest.fn(),
  useIAP: jest.fn(),
}));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.mock("lucide-react-native/icons/coffee", () => "Coffee");
jest.mock("lucide-react-native/icons/hamburger", () => "Hamburger");
jest.mock("lucide-react-native/icons/rocket", () => "Rocket");

interface IIapOptions {
  onPurchaseSuccess: (purchase: { productId: string }) => Promise<void>;
  onPurchaseError: (error: unknown) => void;
}

const mockUseIAP = useIAP as jest.Mock;
const mockGetAvailablePurchases = getAvailablePurchases as jest.Mock;
const mockToastShow = Toast.show as jest.Mock;

const fetchProducts = jest.fn();
const requestPurchase = jest.fn();
const finishTransaction = jest.fn();
const products = [
  { id: "tip_coffee", displayPrice: "$1.99" },
  { id: "tip_lunch", displayPrice: "$4.99" },
];
let iapOptions: IIapOptions;

const setPlatform = (os: "android" | "ios") => {
  jest.replaceProperty(Platform, "OS", os);
};

const setup = () => renderHook(useHelpMe);

describe("useHelpMe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform("android");
    fetchProducts.mockResolvedValue(undefined);
    requestPurchase.mockResolvedValue(undefined);
    finishTransaction.mockResolvedValue(undefined);
    mockGetAvailablePurchases.mockResolvedValue([]);
    mockUseIAP.mockImplementation((options: IIapOptions) => {
      iapOptions = options;
      return {
        connected: true,
        products,
        fetchProducts,
        requestPurchase,
        finishTransaction,
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the tip products and exposes their prices", async () => {
    const { result } = await setup();

    await waitFor(() => expect(result.current.isProductsLoading).toBe(false));

    expect(fetchProducts).toHaveBeenCalledWith({
      skus: ["tip_coffee", "tip_lunch", "tip_feature"],
      type: "in-app",
    });
    expect(result.current.productsById.tip_coffee?.displayPrice).toBe("$1.99");
  });

  it("is unavailable on iOS and never loads or buys", async () => {
    setPlatform("ios");
    const { result } = await setup();

    await act(async () => {
      await result.current.purchase("tip_coffee");
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.productsById).toEqual({});
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(requestPurchase).not.toHaveBeenCalled();
  });

  it("consumes purchases left pending from earlier, only once", async () => {
    const left = { productId: "tip_lunch" };
    mockGetAvailablePurchases.mockResolvedValue([
      left,
      { productId: "something_else" },
    ]);
    const { rerender } = await setup();

    await waitFor(() =>
      expect(finishTransaction).toHaveBeenCalledWith({
        purchase: left,
        isConsumable: true,
      }),
    );
    rerender({});

    expect(finishTransaction).toHaveBeenCalledTimes(1);
    expect(mockGetAvailablePurchases).toHaveBeenCalledTimes(1);
  });

  it("requests a known product and ignores a second purchase while one is running", async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.isProductsLoading).toBe(false));

    await act(async () => {
      await result.current.purchase("tip_coffee");
    });
    expect(result.current.purchasingProductId).toBe("tip_coffee");

    await act(async () => {
      await result.current.purchase("tip_lunch");
    });

    expect(requestPurchase).toHaveBeenCalledTimes(1);
  });

  it("ignores a product it did not load", async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.isProductsLoading).toBe(false));

    await act(async () => {
      await result.current.purchase("tip_feature");
    });

    expect(requestPurchase).not.toHaveBeenCalled();
  });

  it("finishes the transaction as consumable and thanks the user on success", async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.isProductsLoading).toBe(false));
    await act(async () => {
      await result.current.purchase("tip_coffee");
    });

    const purchase = { productId: "tip_coffee" };
    await act(async () => {
      await iapOptions.onPurchaseSuccess(purchase);
    });

    expect(finishTransaction).toHaveBeenCalledWith({
      purchase,
      isConsumable: true,
    });
    expect(mockToastShow).toHaveBeenCalledWith({
      type: "success",
      text1: "Thank you for the coffee! ☕",
    });
    expect(result.current.purchasingProductId).toBeNull();
  });

  it("shows an error and frees the purchase when finishing fails", async () => {
    finishTransaction.mockRejectedValue(new Error("store down"));
    const { result } = await setup();
    await waitFor(() => expect(result.current.isProductsLoading).toBe(false));
    await act(async () => {
      await result.current.purchase("tip_coffee");
    });

    await act(async () => {
      await iapOptions.onPurchaseSuccess({ productId: "tip_coffee" });
    });

    expect(mockToastShow).toHaveBeenCalledWith({
      type: "error",
      text1: "store down",
    });
    expect(result.current.purchasingProductId).toBeNull();
  });

  it("stays quiet when the user cancels, but reports other errors", async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.isProductsLoading).toBe(false));
    await act(async () => {
      await result.current.purchase("tip_coffee");
    });

    await act(async () => {
      iapOptions.onPurchaseError({ code: ErrorCode.UserCancelled });
    });
    expect(mockToastShow).not.toHaveBeenCalled();
    expect(result.current.purchasingProductId).toBeNull();

    await act(async () => {
      iapOptions.onPurchaseError(new Error("payment failed"));
    });
    expect(mockToastShow).toHaveBeenCalledWith({
      type: "error",
      text1: "payment failed",
    });
  });
});
