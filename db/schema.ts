import { relations, sql } from 'drizzle-orm';
import {
  AnyPgColumn,
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
   ⭐ NEW: CURRENCY ENUM (ISO 4217 Valid Currencies)
   ============================================================ */
export const currencyEnum = pgEnum('currency', [
  // Major World Currencies
  'USD', // US Dollar
  'EUR', // Euro
  'GBP', // British Pound
  'PKR', // Pakistani Rupee
  'INR', // Indian Rupee
  'AED', // UAE Dirham
  'SAR', // Saudi Riyal
  'JPY', // Japanese Yen
  'CAD', // Canadian Dollar
  'AUD', // Australian Dollar
  'CHF', // Swiss Franc
  'CNY', // Chinese Yuan
]);

/* ============================================================
   ENUMS (Existing, unchanged)
   ============================================================ */
export const accountTypeEnum = pgEnum('account_type', [
  'CASH',
  'BANK',
  'CREDIT_CARD',
  'MOBILE_WALLET',
  'INVESTMENT',
  'OTHER',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'EXPENSE',
  'INCOME',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'PENGING', // Note: typo? Should be 'PENDING' but keep as is for now
  'COMPLETED',
  'CANCELLED',
]);

export const categoryTypeEnum = pgEnum('category_type', ['INCOME', 'EXPENSE']);

export const recurringFrequencyEnum = pgEnum('recurring_frequency', [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
]);

export const budgetPeriodEnum = pgEnum('budget_period', [
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'CREATE',
  'UPDATE',
  'DELETE',
  'ARCHIVE',
  'RESTORE',
]);

/* ============================================================
   USERS (⭐ Added: Plaid fields)
   ============================================================ */
export const users = pgTable(
  'users',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 320 }).notNull().unique(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    imageUrl: text('image_url'),

    // ⭐ NEW: Plaid Sandbox credentials (store encrypted in production)
    plaidAccessToken: text('plaid_access_token'),
    plaidItemId: varchar('plaid_item_id', { length: 255 }).unique(),

    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    activeUsersIdx: index('users_is_active_idx').on(table.isActive),
    deletedUsersIdx: index('users_deleted_at_idx').on(table.deletedAt),
    // ⭐ NEW: index for Plaid Item ID lookups
    plaidItemIdx: index('users_plaid_item_idx').on(table.plaidItemId),
  }),
);

/* ============================================================
   ACCOUNTS (⭐ Major updates: Currency enum, Plaid, Soft delete)
   ============================================================ */
export const accounts = pgTable(
  'accounts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    name: varchar('name', { length: 100 }).notNull(),
    type: accountTypeEnum('type').default('CASH').notNull(),

    balance: numeric('balance', { precision: 14, scale: 2 })
      .default('0')
      .notNull(),
    // ⭐ CHANGED: currency now uses enum
    currency: currencyEnum('currency').default('PKR').notNull(),

    color: varchar('color', { length: 20 }),
    icon: varchar('icon', { length: 50 }),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    // ⭐ NEW: Plaid specific fields
    plaidAccountId: varchar('plaid_account_id', { length: 255 }).unique(),
    plaidItemId: varchar('plaid_item_id', { length: 255 }),
    mask: varchar('mask', { length: 4 }), // last 4 digits
    subtype: varchar('subtype', { length: 50 }), // e.g., 'checking', 'savings'

    // ⭐ NEW: Soft delete
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),

    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('accounts_user_id_idx').on(table.userId),
    userActiveIdx: index('accounts_user_active_idx').on(
      table.userId,
      table.isActive,
    ),
    userAccountNameUnique: uniqueIndex('accounts_user_id_name_unique_idx').on(
      table.userId,
      table.name,
    ),
    oneDefaultAccountPerUser: uniqueIndex('accounts_one_default_per_user_idx')
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),

    // ❌ REMOVED: currencyFormatCheck (now handled by enum)

    // ⭐ NEW: indexes for Plaid lookups
    plaidAccountIdx: index('accounts_plaid_account_idx').on(
      table.plaidAccountId,
    ),
    plaidItemIdx: index('accounts_plaid_item_idx').on(table.plaidItemId),
    // ⭐ NEW: deletedAt index
    deletedAtIdx: index('accounts_deleted_at_idx').on(table.deletedAt),
  }),
);

/* ============================================================
   CATEGORIES (⭐ Fixed parentId type + soft delete)
   ============================================================ */
export const categories = pgTable(
  'categories',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    name: varchar('name', { length: 100 }),
    type: categoryTypeEnum('type').notNull(),

    // ⭐ FIXED: parentId now integer with self-foreign-key
    parentId: integer('parent_id').references(
      (): AnyPgColumn => categories.id,
      {
        onDelete: 'set null',
        onUpdate: 'cascade',
      },
    ),

    icon: varchar('icon', { length: 50 }),
    color: varchar('color', { length: 20 }),
    isSystem: boolean('is_system').default(true).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    // ⭐ NEW: Soft delete
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),

    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('categories_user_id_idx').on(table.userId),
    parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
    userCategoryNameUnique: uniqueIndex(
      'categories_user_name_type_unique_idx',
    ).on(table.userId, table.name, table.type),
    // ⭐ NEW: deletedAt index
    deletedAtIdx: index('categories_deleted_at_idx').on(table.deletedAt),
  }),
);

/* ============================================================
   TRANSACTIONS (⭐ Major updates: Currency enum, Plaid, Soft delete, Fixed indexes)
   ============================================================ */
export const transactions = pgTable(
  'transactions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    categoryId: integer('category_id').references(() => categories.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // changed: notNull? We'll keep it nullable because set null is used.

    type: transactionTypeEnum('type').notNull(),
    status: transactionStatusEnum('status').default('COMPLETED').notNull(),

    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    // ⭐ CHANGED: currency now enum
    currency: currencyEnum('currency').default('PKR').notNull(),

    description: varchar('description', { length: 255 }),
    merchant: varchar('merchant', { length: 150 }),
    notes: text('notes'),
    transactionDate: timestamp('transaction_date', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    reference: varchar('reference', { length: 255 }),

    // ⭐ NEW: Plaid fields
    plaidTransactionId: varchar('plaid_transaction_id', {
      length: 255,
    }).unique(),
    pending: boolean('pending').default(false),
    pendingTransactionId: varchar('pending_transaction_id', { length: 255 }),
    authorizedDate: timestamp('authorized_date', {
      withTimezone: true,
      mode: 'date',
    }),

    // ⭐ NEW: Soft delete
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),

    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    // ⭐ FIXED: separate indexes for accountId and categoryId
    accountIdIdx: index('transactions_account_id_idx').on(table.accountId),
    categoryIdIdx: index('transactions_category_id_idx').on(table.categoryId),
    transactionDateIdx: index('transactions_transaction_date_idx').on(
      table.transactionDate,
    ),
    // ⭐ FIXED: added columns to userDateIdx
    userDateIdx: index('transactions_user_date_idx').on(
      table.userId,
      table.transactionDate,
    ),
    userTypeIdx: index('transaction_user_type_idx').on(
      table.userId,
      table.type,
    ),

    amountPositiveCheck: check(
      'transactions_amount_positive_check',
      sql`${table.amount} > 0`,
    ),
    // ❌ REMOVED: currencyFormatCheck (enum handles)

    // ⭐ NEW: Plaid index
    plaidTxIdx: index('transactions_plaid_id_idx').on(table.plaidTransactionId),
    deletedAtIdx: index('transactions_deleted_at_idx').on(table.deletedAt),
  }),
);

/* ============================================================
   TRANSFERS (⭐ Added deletedAt, currency enum, and transaction link)
   ============================================================ */
export const transfers = pgTable(
  'transfers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    fromAccountId: integer('from_account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    toAccountId: integer('to_account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),

    // ⭐ Already added from earlier suggestion
    transactionId: integer('transaction_id').references(() => transactions.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    fee: numeric('fee', { precision: 14, scale: 2 }).default('0').notNull(),

    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    // ⭐ CHANGED: currency enum
    currency: currencyEnum('currency').default('PKR').notNull(),

    description: varchar('description', { length: 255 }),
    notes: text('notes'),
    transferDate: timestamp('transfer_date', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    status: transactionStatusEnum('status').default('COMPLETED').notNull(),

    // ⭐ NEW: Soft delete (optional but we add for consistency)
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),

    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('transfers_user_id_idx').on(table.userId),
    fromAccountIdx: index('transfers_from_account_idx').on(table.fromAccountId),
    toAccountIdx: index('transfers_to_account_idx').on(table.toAccountId),
    transferDateIdx: index('transfers_date_idx').on(table.transferDate),
    amountPositiveCheck: check(
      'transfers_amount_positive_check',
      sql`${table.amount} > 0`,
    ),
    differentAccountsCheck: check(
      'transfers_different_accounts_check',
      sql`${table.fromAccountId} <> ${table.toAccountId}`,
    ),
    // ❌ REMOVED: currencyFormatCheck
    transactionIdIdx: index('transfers_transaction_id_idx').on(
      table.transactionId,
    ),
    feeNonNegativeCheck: check(
      'transfers_fee_non_negative_check',
      sql`${table.fee} >= 0`,
    ),
    // ⭐ NEW: deletedAt index
    deletedAtIdx: index('transfers_deleted_at_idx').on(table.deletedAt),
  }),
);

/* ============================================================
   RECURRING TRANSACTIONS (⭐ Currency enum only)
   ============================================================ */
export const recurringTransactions = pgTable(
  'recurring_transaction',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    categoryId: integer('category_id').references(() => categories.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    type: transactionTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    // ⭐ CHANGED: currency enum
    currency: currencyEnum('currency').default('PKR').notNull(),
    description: varchar('description', { length: 255 }),
    frequency: recurringFrequencyEnum('frequency').notNull(),
    startDate: timestamp('start_date', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true, mode: 'date' }),
    nextRunAt: timestamp('next_run_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true, mode: 'date' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('recurring_transactions_user_id_idx').on(table.userId),
    nextRunIdx: index('recurring_transactions_next_run_idx').on(
      table.nextRunAt,
    ),
    activeNextRunIdx: index('recurring_transactions_active_next_run_idx').on(
      table.isActive,
      table.nextRunAt,
    ),
    amountPositiveCheck: check(
      'recurring_transactions_amount_positive_check',
      sql`${table.amount} > 0`,
    ),
  }),
);

/* ============================================================
   BUDGETS (⭐ Currency enum only)
   ============================================================ */
export const budgets = pgTable(
  'budgets',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    period: budgetPeriodEnum('period').notNull(),
    startDate: timestamp('start_date', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    endDate: timestamp('end_date', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    // ⭐ CHANGED: currency enum
    currency: currencyEnum('currency').default('PKR').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('budgets_user_id_idx').on(table.userId),
    activeBudgetIdx: index('budgets_user_active_idx').on(
      table.userId,
      table.isActive,
    ),
    amountPositiveCheck: check(
      'budgets_amount_positive_check',
      sql`${table.amount} > 0`,
    ),
    validDateRangeCheck: check(
      'budgets_valid_date_range_check',
      sql`${table.endDate} >= ${table.startDate}`,
    ),
  }),
);

/* ============================================================
   BUDGET CATEGORIES (unchanged)
   ============================================================ */
export const budgetCategories = pgTable(
  'budget_categories',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    budgetId: integer('budget_id')
      .notNull()
      .references(() => budgets.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    limitAmount: numeric('limit_amount', { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    budgetCategoryUnique: uniqueIndex(
      'budget_categories_budget_category_unique_idx',
    ).on(table.budgetId, table.categoryId),
    budgetIdIdx: index('budget_categories_budget_id_idx').on(table.budgetId),
    categoryIdIdx: index('budget_categories_category_id_idx').on(
      table.categoryId,
    ),
    positiveLimitCheck: check(
      'budget_categories_limit_positive_check',
      sql`${table.limitAmount} > 0`,
    ),
  }),
);

/* ============================================================
   NOTIFICATIONS (unchanged)
   ============================================================ */
export const notifications = pgTable(
  'notifications',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    message: text('message').notNull(),
    data: text('data'),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    unreadIdx: index('notifications_user_unread_idx').on(
      table.userId,
      table.readAt,
    ),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  }),
);

/* ============================================================
   ATTACHMENTS (unchanged)
   ============================================================ */
export const attachments = pgTable(
  'attachments',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    transactionId: integer('transaction_id')
      .notNull()
      .references(() => transactions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    storageKey: text('storage_key').notNull(),
    fileUrl: text('file_url').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    transactionIdIdx: index('attachments_transaction_id_idx').on(
      table.transactionId,
    ),
    userIdIdx: index('attachments_user_id_idx').on(table.userId),
    fileSizeCheck: check(
      'attachments_file_size_positive_check',
      sql`${table.fileSize} > 0`,
    ),
  }),
);

/* ============================================================
   TAGS (unchanged)
   ============================================================ */
export const tags = pgTable(
  'tags',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    color: varchar('color', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userTagUnique: uniqueIndex('tags_user_name_unique_idx').on(
      table.userId,
      table.name,
    ),
  }),
);

/* ============================================================
   TRANSACTION TAGS (unchanged)
   ============================================================ */
export const transactionTags = pgTable(
  'transaction_tags',
  {
    transactionId: integer('transaction_id')
      .notNull()
      .references(() => transactions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => ({
    primaryKey: uniqueIndex('transaction_tags_unique_idx').on(
      table.transactionId,
      table.tagId,
    ),
    transactionIdIdx: index('transaction_tags_transaction_id_idx').on(
      table.transactionId,
    ),
    tagIdIdx: index('transaction_tags_tag_id_idx').on(table.tagId),
  }),
);

/* ============================================================
   AUDIT LOGS (unchanged)
   ============================================================ */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    action: auditActionEnum('action').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: integer('entity_id'),
    oldValues: text('old_values'),
    newValues: text('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    entityIdx: index('audit_logs_entity_idx').on(
      table.entityType,
      table.entityId,
    ),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  }),
);

/* ============================================================
   RELATIONS (updated for new fields)
   ============================================================ */

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  transfers: many(transfers),
  recurringTransactions: many(recurringTransactions),
  budgets: many(budgets),
  notifications: many(notifications),
  attachments: many(attachments),
  tags: many(tags),
  auditLogs: many(auditLogs),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
  outgoingTransfers: many(transfers, { relationName: 'fromAccount' }),
  incomingTransfers: many(transfers, { relationName: 'toAccount' }),
  recurringTransactions: many(recurringTransactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  children: many(categories, { relationName: 'categoryHierarchy' }),
  transactions: many(transactions),
  recurringTransactions: many(recurringTransactions),
  budgetCategories: many(budgetCategories),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(users, { fields: [transactions.userId], references: [users.id] }),
    account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.id],
    }),
    category: one(categories, {
      fields: [transactions.categoryId],
      references: [categories.id],
    }),
    attachments: many(attachments),
    tags: many(transactionTags),
  }),
);

export const transfersRelations = relations(transfers, ({ one }) => ({
  user: one(users, { fields: [transfers.userId], references: [users.id] }),
  fromAccount: one(accounts, {
    fields: [transfers.fromAccountId],
    references: [accounts.id],
    relationName: 'fromAccount',
  }),
  toAccount: one(accounts, {
    fields: [transfers.toAccountId],
    references: [accounts.id],
    relationName: 'toAccount',
  }),
  // ⭐ Link to transaction (for fee/ledger entry)
  transaction: one(transactions, {
    fields: [transfers.transactionId],
    references: [transactions.id],
  }),
}));

export const recurringTransactionsRelations = relations(
  recurringTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [recurringTransactions.userId],
      references: [users.id],
    }),
    account: one(accounts, {
      fields: [recurringTransactions.accountId],
      references: [accounts.id],
    }),
    category: one(categories, {
      fields: [recurringTransactions.categoryId],
      references: [categories.id],
    }),
  }),
);

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  categories: many(budgetCategories),
}));

export const budgetCategoriesRelations = relations(
  budgetCategories,
  ({ one }) => ({
    budget: one(budgets, {
      fields: [budgetCategories.budgetId],
      references: [budgets.id],
    }),
    category: one(categories, {
      fields: [budgetCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  user: one(users, { fields: [attachments.userId], references: [users.id] }),
  transaction: one(transactions, {
    fields: [attachments.transactionId],
    references: [transactions.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  transactions: many(transactionTags),
}));

export const transactionTagsRelations = relations(
  transactionTags,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionTags.transactionId],
      references: [transactions.id],
    }),
    tag: one(tags, { fields: [transactionTags.tagId], references: [tags.id] }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

/* ============================================================
   TYPES (unchanged, inferred automatically)
   ============================================================ */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;
export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
