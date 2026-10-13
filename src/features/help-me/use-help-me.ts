import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { getAvailablePurchases, useIAP } from "expo-iap";
import type { Purchase } from "expo-iap";
import {
  getErrorMessage,
  HELP_ME_SKUS,
  isHelpMeProductId,
  isPendingError,
  isUserCancelledError,
  showError,
  showPending,
  showSuccess,
} from "./help-me.utils";
import type {
  IHelpMeProductDetails,
  IUseHelpMeReturn,
} from "./help-me.interface";

export default function useHelpMe(): IUseHelpMeReturn {
  const isAvailable = Platform.OS === "android";

  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(
    null,
  );

  const purchasingProductIdRef = useRef<string | null>(null);
  const hasConsumedPendingRef = useRef(false);
  const finishingTokensRef = useRef(new Set<string>());

  // Completes a purchase once, even if the purchase listener and the startup
  // sweep both see the same one.
  const finishOnce = useCallback(
    async (
      purchase: Purchase,
      finish: (purchase: Purchase) => Promise<void>,
    ) => {
      const token = purchase.purchaseToken ?? purchase.id;

      if (finishingTokensRef.current.has(token)) {
        return false;
      }

      finishingTokensRef.current.add(token);

      try {
        await finish(purchase);
        return true;
      } finally {
        finishingTokensRef.current.delete(token);
      }
    },
    [],
  );

  const setPurchasingProductIdState = useCallback(
    (productId: string | null) => {
      purchasingProductIdRef.current = productId;
      setPurchasingProductId(productId);
    },
    [],
  );

  const handlePurchaseError = useCallback(
    (purchaseError: unknown) => {
      if (isPendingError(purchaseError)) {
        showPending();
      } else if (!isUserCancelledError(purchaseError)) {
        showError(getErrorMessage(purchaseError));
      }

      setPurchasingProductIdState(null);
    },
    [setPurchasingProductIdState],
  );

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      if (!isHelpMeProductId(purchase.productId)) {
        return;
      }

      if (purchase.purchaseState === "pending") {
        showPending();
        setPurchasingProductIdState(null);
        return;
      }

      try {
        const finished = await finishOnce(purchase, (item) =>
          finishTransaction({ purchase: item, isConsumable: true }),
        );

        if (finished) {
          showSuccess(purchase.productId);
        }
      } catch (finishError) {
        showError(getErrorMessage(finishError));
      } finally {
        setPurchasingProductIdState(null);
      }
    },
    onPurchaseError: handlePurchaseError,
  });

  const productsById = useMemo(() => {
    if (!isAvailable) {
      return {};
    }

    return products.reduce<Record<string, IHelpMeProductDetails>>(
      (acc, product) => {
        if (!isHelpMeProductId(product.id)) {
          return acc;
        }

        acc[product.id] = {
          id: product.id,
          displayPrice: product.displayPrice,
        };
        return acc;
      },
      {},
    );
  }, [isAvailable, products]);

  const consumePendingPurchases = useCallback(async () => {
    if (!isAvailable || hasConsumedPendingRef.current) {
      return;
    }

    try {
      const pendingPurchases = await getAvailablePurchases();

      hasConsumedPendingRef.current = true;

      for (const purchase of pendingPurchases) {
        if (
          !isHelpMeProductId(purchase.productId) ||
          purchase.purchaseState === "pending"
        ) {
          continue;
        }

        try {
          await finishOnce(purchase, (item) =>
            finishTransaction({ purchase: item, isConsumable: true }),
          );
        } catch (pendingError) {
          console.warn(
            "[useHelpMe] Failed to consume pending purchase:",
            pendingError,
          );
        }
      }
    } catch (pendingError) {
      console.warn(
        "[useHelpMe] Failed to fetch pending purchases:",
        pendingError,
      );
    }
  }, [finishOnce, finishTransaction, isAvailable]);

  useEffect(() => {
    if (!isAvailable || !connected) {
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setIsProductsLoading(true);

      try {
        await fetchProducts({ skus: HELP_ME_SKUS, type: "in-app" });
        if (!cancelled) {
          await consumePendingPurchases();
        }
      } catch (loadError) {
        if (!cancelled) {
          showError(getErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setIsProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [connected, consumePendingPurchases, fetchProducts, isAvailable]);

  const purchase = useCallback(
    async (productId: string) => {
      if (
        !isAvailable ||
        !connected ||
        isProductsLoading ||
        purchasingProductIdRef.current ||
        !productsById[productId]
      ) {
        return;
      }

      setPurchasingProductIdState(productId);
      try {
        await requestPurchase({
          request: {
            apple: { sku: productId },
            google: { skus: [productId] },
          },
          type: "in-app",
        });
      } catch (purchaseError) {
        handlePurchaseError(purchaseError);
      }
    },
    [
      connected,
      handlePurchaseError,
      isAvailable,
      isProductsLoading,
      productsById,
      requestPurchase,
      setPurchasingProductIdState,
    ],
  );

  return {
    isAvailable,
    isProductsLoading,
    productsById,
    purchasingProductId,
    purchase,
  };
}
