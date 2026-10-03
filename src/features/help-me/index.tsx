import { ActivityIndicator, Text } from "react-native";
import { PAGE_TITLES } from "@/constants/routes";
import { ActionCard, actionCardStyles, ShortHeading } from "@/components";
import { TabsLayout } from "@/layouts";
import { HELP_ME_PRODUCTS } from "./help-me.data";
import useHelpMe from "./use-help-me";

export default function HelpMe() {
  const {
    isAvailable,
    isProductsLoading,
    productsById,
    purchasingProductId,
    purchase,
  } = useHelpMe();

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.HELP_ME }}>
      <ShortHeading heading="SUPPORT THE APP" />

      {HELP_ME_PRODUCTS.map((tier) => {
        const isPurchasing = purchasingProductId === tier.id;
        const displayPrice = productsById[tier.id]?.displayPrice;

        return (
          <ActionCard
            key={tier.id}
            label={tier.label}
            description={tier.description}
            icon={tier.icon}
            disabled={
              !isAvailable ||
              isProductsLoading ||
              !productsById[tier.id] ||
              isPurchasing
            }
            onPress={() => purchase(tier.id)}
            trailing={
              isPurchasing ? (
                <ActivityIndicator size="small" />
              ) : displayPrice ? (
                <Text style={actionCardStyles.trailingText}>
                  {displayPrice}
                </Text>
              ) : null
            }
          />
        );
      })}
    </TabsLayout>
  );
}
