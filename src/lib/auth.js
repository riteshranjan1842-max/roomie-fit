import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "./mongodb";

const db = client.db(process.env.MONGODB_DB_NAME || "roomiefit");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_google_client_secret",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "default_better_auth_secret_placeholder_32_chars_long",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  trustedOrigins: [
    "http://localhost:3000",
    "https://roomie-fit-eight.vercel.app",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean),
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,     // 1 day
  },
});
