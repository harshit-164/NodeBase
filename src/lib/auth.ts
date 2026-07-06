import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { getOptionalEnv } from "./env";
import { isPolarConfigured, polarClient } from "./polar";

const githubClientId = getOptionalEnv("GITHUB_CLIENT_ID");
const githubClientSecret = getOptionalEnv("GITHUB_CLIENT_SECRET");
const googleClientId = getOptionalEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");
const polarSuccessUrl = getOptionalEnv("POLAR_SUCCESS_URL");

const socialProviders = {
  ...(githubClientId && githubClientSecret
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        },
      }
    : {}),
  ...(googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {}),
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders,
  plugins: isPolarConfigured
    ? [
        polar({
          client: polarClient,
          createCustomerOnSignUp: true,
          use: [
            checkout({
              products: [
                {
                  productId: "f81be8a8-45e1-4e45-a1e9-b9d3fd79f814",
                  slug: "pro",
                },
              ],
              successUrl: polarSuccessUrl,
              authenticatedUsersOnly: true,
            }),
            portal(),
          ],
        }),
      ]
    : [],
});
