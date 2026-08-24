import { db } from '@/db';
import { accounts, users } from '@/db/schema';
import { accountSchema } from '@/types/accounts.types';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } },
) {
  try {
    const { userId: clerk_user_id } = await auth();
    if (!clerk_user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerk_user_id));
    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not registered in local database' },
        { status: 404 },
      );
    }
    const internalUserId = userResult[0].id;
    const accountId = parseInt(params.accountId, 10);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid Account ID format' },
        { status: 400 },
      );
    }
    const userAccounts = await db
      .select({ id: accounts.id, userId: accounts.userId })
      .from(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, internalUserId)),
      );
    if (userAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: true, account: userAccounts[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { accountId: string } },
) {
  try {
    const { userId: userIdClerk } = await auth();
    if (!userIdClerk) return new Response('Unauthorized', { status: 401 });
    const user_id = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, userIdClerk));
    if (user_id.length === 0) {
      return NextResponse.json(
        { error: 'User not registered in local database' },
        { status: 404 },
      );
    }
    const body = await request.json();
    const validation = accountSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(validation.error.format(), { status: 400 });
    }
    const accountId = Number(params.accountId);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid Account ID' },
        { status: 400 },
      );
    }
    const currentUserId = user_id[0].id;
    const [updatedAccount] = await db
      .update(accounts)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, currentUserId)),
      )
      .returning();
    if (!updatedAccount) {
      return NextResponse.json('Account not found or access denied', {
        status: 404,
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
