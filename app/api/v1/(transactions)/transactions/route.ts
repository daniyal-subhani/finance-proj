import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { requireUser } from '@/lib/auth/require-user';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const data = await req.json();
    const user = await requireUser();
    const { accountId: accountIdParams } = await params;
    const accId = Number(accountIdParams);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isNaN(accId) || accId <= 0) {
      return NextResponse.json(
        { error: 'Invalid Credientials' },
        { status: 401 },
      );
    }
    const account = await db
      .select({ id: accounts.id, type: accounts.type })
      .from(accounts)
      .where(
        and(
          eq(accounts.id, accId),
          eq(accounts.userId, user.id),
          eq(accounts.type, data.accType),
        ),
      );
    if (!account || account.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Credientials' },
        { status: 400 },
      );
    }
    const [transaction] = await db
      .select({ id: transactions.id, type: transactions.type })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accId),
          eq(transactions.userId, user.id),
        ),
      );
    if (!transaction || [transaction].length === 0) {
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { accountId: accountIdParams } = await params;
    const accId = Number(accountIdParams);
    if (!accId || accId <= 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await requireUser();
    const data = await req.json();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
    }
    const addTransaction = await db;
    return NextResponse.json(
      { success: true, addTransaction },
      { status: 201 },
    );
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
