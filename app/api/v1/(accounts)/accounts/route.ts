// app/api/v1/accounts/route.ts
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/current-user';
import { accountSchema } from '@/types/accounts.types';
import { and, eq, isNull } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const validated = accountSchema.parse(data);

    const [newAccount] = await db
      .insert(accounts)
      .values({
        userId: user.id,
        name: validated.name,
        type: validated.type,
        balance: validated.balance,
        color: validated.color,
        icon: validated.icon,
        currency: validated.currency,
        isActive: validated.isActive,
        isDefault: validated.isDefault,
        mask: validated.mask,
        plaidAccountId: validated.plaidAccountId,
        plaidItemId: validated.plaidItemId,
        subtype: validated.subtype,
      })
      .returning();
    return NextResponse.json({ newAccount, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error Creating Account', { error });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), isNull(accounts.deletedAt)));
    return NextResponse.json(userAccounts, { status: 200 });
  } catch (error) {
    console.error('Error Fetching Accounts', { error });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
