import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "vectra_super_secret_auth_key_2026_d7f9a1b2c3d4e5f6",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Pendaftaran mandiri publik dimatikan total (hanya admin yang dapat mengundang/membuat user)
    disableSignUp: true,
  },
  plugins: [
    admin({
      defaultRole: "operator",
      adminRole: "admin",
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 Hari
    updateAge: 60 * 60 * 24, // Update setiap 1 hari
  },
});
