import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const postgresql = neon(process.env.DATABASE_URL!);
export const db = drizzle(postgresql, { schema });
