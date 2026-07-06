import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

type SubscriptionState = {
  activeSubscriptions?: Array<{ id: string }>;
  billingEnabled?: boolean;
  billingError?: string;
};

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const result = await authClient.customer.state();

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to load subscription");
      }

      return result.data as SubscriptionState;
    },
  });
};

export const useHasActiveSubscription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscription();

  const hasActiveSubscription = Boolean(
    customerState?.activeSubscriptions?.length,
  );

  return {
    hasActiveSubscription,
    isBillingEnabled: customerState?.billingEnabled ?? false,
    subscription: customerState?.activeSubscriptions?.[0],
    isLoading,
    ...rest,
  };
};
