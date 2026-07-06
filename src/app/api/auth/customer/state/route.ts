import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isPolarConfigured, mockCustomerState, polarClient } from "@/lib/polar";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isPolarConfigured) {
    return NextResponse.json({
      ...mockCustomerState,
      billingEnabled: false,
    });
  }

  try {
    const customerState = await polarClient.customers.getStateExternal({
      externalId: session.user.id,
    });

    return NextResponse.json({
      ...customerState,
      billingEnabled: true,
    });
  } catch (error) {
    console.error("Polar customer state lookup failed", error);

    return NextResponse.json({
      activeSubscriptions: [],
      billingEnabled: false,
      billingError: "POLAR_CUSTOMER_STATE_UNAVAILABLE",
    });
  }
};
