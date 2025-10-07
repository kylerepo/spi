import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as schema from './shared/neon-schema';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined');
  process.exit(1);
}

async function migrateDatabase() {
  try {
    console.log('🚀 Starting Neon database migration...');
    
    const sql = neon(connectionString);
    const db = drizzle(sql, { schema });

    console.log('📦 Running migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Migration completed successfully!');
    
    // Test connection
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connection verified:', result[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();