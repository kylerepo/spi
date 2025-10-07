import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/neon-schema';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Database helper functions
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connection successful:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}