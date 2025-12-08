import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/scraper_db';

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
