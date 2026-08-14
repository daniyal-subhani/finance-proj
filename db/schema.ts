import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

/* ============================================================
   ENUMS
   ============================================================ */

export const accountTypeEnum = pgEnum('account_type', [
  'CASH',
  'BANK',
  'CREDIT_CARD',
  'MOBILE_WALLET',
  'INVESTMENT',
  'OTHER',
]);

/* ============================================================
   USERS
   ============================================================ */

export const users = pgTable(
  'users',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    clerkUserId: varchar('clerk_user_id', {
      length: 255,
    })
      .notNull()
      .unique(),

    email: varchar('email', {
      length: 320,
    })
      .notNull()
      .unique(),

    firstName: varchar('first_name', {
      length: 100,
    }),

    lastName: varchar('last_name', {
      length: 100,
    }),

    imageUrl: text('image_url'),

    isActive: boolean('is_active').default(true).notNull(),

    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
      mode: 'date',
    }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    activeUsersIdx: index('users_is_active_idx').on(table.isActive),

    deletedUsersIdx: index('users_deleted_at_idx').on(table.deletedAt),
  }),
);

/* ============================================================
   ACCOUNTS
   ============================================================ */

export const accounts = pgTable(
  'accounts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    name: varchar('name', {
      length: 100,
    }).notNull(),

    type: accountTypeEnum('type').default('CASH').notNull(),

    /*
     * Exact decimal monetary value.
     *
     * precision: 12
     * scale: 2
     *
     * Maximum:
     * 9,999,999,999.99
     */
    balance: numeric('balance', {
      precision: 12,
      scale: 2,
    })
      .default('0')
      .notNull(),

    currency: varchar('currency', {
      length: 3,
    })
      .default('PKR')
      .notNull(),

    color: varchar('color', {
      length: 20,
    }),

    icon: varchar('icon', {
      length: 50,
    }),

    isDefault: boolean('is_default').default(false).notNull(),

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    archivedAt: timestamp('archived_at', {
      withTimezone: true,
      mode: 'date',
    }),
  },
  (table) => ({
    /* Fast user → accounts lookup */
    userIdIdx: index('accounts_user_id_idx').on(table.userId),

    /* User's active accounts */
    userActiveIdx: index('accounts_user_active_idx').on(
      table.userId,
      table.isActive,
    ),

    /* One account name per user */
    userAccountNameUnique: uniqueIndex('accounts_user_id_name_unique_idx').on(
      table.userId,
      table.name,
    ),

    /* Only one default account per user */
    oneDefaultAccountPerUser: uniqueIndex('accounts_one_default_per_user_idx')
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),

    /* Currency must be exactly 3 uppercase letters */
    currencyFormatCheck: check(
      'accounts_currency_format_check',
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
  }),
);

/* ============================================================
   RELATIONS
   ============================================================ */

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

/* ============================================================
   TYPES
   ============================================================ */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
