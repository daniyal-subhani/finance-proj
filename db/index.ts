import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const postgresql = neon(process.env.DATABASE_URL!);
export const db = drizzle(postgresql);
