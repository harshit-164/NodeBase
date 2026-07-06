import { Polar } from "@polar-sh/sdk";
import { getOptionalEnv } from "./env";

export const polarAccessToken = getOptionalEnv("POLAR_ACCESS_TOKEN");
export const isPolarConfigured = Boolean(polarAccessToken);

export const mockCustomerState = {
  activeSubscriptions: [{ id: "mock-subscription" }],
};

export const polarClient = new Polar({
  accessToken: polarAccessToken,
  server: "sandbox",
});
