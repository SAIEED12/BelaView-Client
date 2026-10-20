import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { db, schema } from "@/lib/db";

const baseURL = process.env.BETTER_AUTH_URL || undefined;

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      strategy: "jwt",
    },
  },
  trustedOrigins: [
    baseURL,
    "https://belaviewbd.com",
    "https://www.belaviewbd.com",
    "http://localhost:3000",
  ].filter(Boolean),
  plugins: [jwt()],
});
