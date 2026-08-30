import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { requireUser } from '@/lib/auth/require-user';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string; transactionId: string }> },
) {
  try {
    const user = await requireUser();
    const { requestedUserId } = await req.json();
    const resolveParams = await params;
    const accountId = parseInt(resolveParams.accountId, 10);
    const transactionId = parseInt(resolveParams.transactionId, 10);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!transactionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.id !== requestedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const account = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, user.id)));
    if (!account || account.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Credientials' },
        { status: 400 },
      );
    }
    const transaction = await db
      .select({ id: transactions })
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.accountId, accountId),
          eq(transactions.userId, user.id),
        ),
      );
    if (!transaction || transaction.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Credientials' },
        { status: 400 },
      );
    }
    return NextResponse.json({ sucess: true, transaction }, { status: 200 });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
