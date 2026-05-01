import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; 
import { config } from 'dotenv';
config({ path: '.env' });

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL!, 
    socialProviders: {
        google: { 
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
});