import { string } from 'drizzle-orm/cockroach-core/columns/string';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: string().references().clerk(),
  createdAt: Date().now(),
  updatedAt: Date().update(),
});
