import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema';

config({ path: '.env.local' });

const postgresql = neon(process.env.DATABASE_URL!);
const db = drizzle(postgresql, { schema });

const main = async () => {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Migration completed');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

main();
