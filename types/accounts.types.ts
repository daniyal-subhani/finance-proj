// types/accounts.types.ts

import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1).max(10),
  type: z.enum([
    'CASH',
    'BANK',
    'CREDIT_CARD',
    'MOBILE_WALLET',
    'INVESTMENT',
    'OTHER',
  ]),
  balance: z.string().optional().default('0'),
  currency: z
    .enum([
      'PKR',
      'USD',
      'EUR',
      'GBP',
      'INR',
      'AED',
      'SAR',
      'JPY',
      'CAD',
      'AUD',
      'CHF',
      'CNY',
    ])
    .default('PKR'),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // optional fields - user also can make acc manually
  plaidAccountId: z.string().optional(),
  plaidItemId: z.string().optional(),
  mask: z.string().optional(),
  subtype: z.string().optional(),
});
