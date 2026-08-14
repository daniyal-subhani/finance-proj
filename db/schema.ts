import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar('clerk_user_id', {
    length: 255,
  })
    .notNull()
    .unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('CASH'),
  // type should be - enum: CASH (physical cash), BANK(saving/current), CREDIT_CARD(udhaar pe lena), MOBILE_WALLET(jazzcash/easypaisa/payfast)
  balance: numeric('balance', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  /* 
    precision 12, scale 2 => matlab total 12 digits aur decimal ke baad 2 digits.
    Example: 1234567890.99 (yeh kaafi bada amount handle kar lega)
  */

  currency: varchar('currency', { length: 10 }).default('PKR').notNull(),
  color: varchar('color', { length: 20 }), // UI ke liye color (badge ya background color)
  idDefault: boolean('is_default').default(false), // kya ye default account hai, jb user naya transaction add kare to auto select ho
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// RELATIONS (TS autocomplete ke liye)
export const userRelations = relations(accounts, ({ many }) => ({
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(usersTable, {
    fields: [accounts.userId],
    references: [usersTable.id],
  }),
}));
