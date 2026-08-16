import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '@/config/env';
import { drizzle } from 'drizzle-orm/neon-http';

const postgresql = neon(env.DATABASE_URL!);
export const db = drizzle(postgresql, { schema });
