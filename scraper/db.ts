import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/scraper_db';

// Create postgres connection
export const client = postgres(DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, { schema });
