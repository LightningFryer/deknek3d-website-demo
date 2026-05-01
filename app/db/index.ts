import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env' });

// Disable prepared statements for Supabase Transaction Pooler (PgBouncer) on Vercel
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});
export const db = drizzle({ client });
