import { db } from '@/db';
import { accounts, users } from '@/db/schema';
import { requireUser } from '@/lib/auth/require-user';
import { accountSchema } from '@/types/accounts.types';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const user = await requireUser();
    const resolvedParams = await params;
    const accountId = parseInt(resolvedParams.accountId, 10);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid Account ID format' },
        { status: 400 },
      );
    }
    const userAccounts = await db
      .select({ id: accounts.id, userId: accounts.userId })
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, user.id)));
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
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const validation = accountSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(validation.error.format(), { status: 400 });
    }
    const resolvedParams = await params;
    const accountId = parseInt(resolvedParams.accountId, 10);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid Account ID' },
        { status: 400 },
      );
    }
    const [updatedAccount] = await db
      .update(accounts)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, user.id)))
      .returning();
    if (!updatedAccount) {
      return NextResponse.json('Account not found or access denied', {
        status: 404,
      });
    }
    return NextResponse.json(
      { message: 'Account Updated Successfully!', updatedAccount },
      { status: 200 },
    );
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { userId: clerkUserID } = await auth.protect();
    const resolvedParams = await params;
    const accountId = parseInt(resolvedParams.accountId, 10);
    if (!clerkUserID) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid Account ID' },
        { status: 400 },
      );
    }

    const user_id = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserID));
    const currentUserId = user_id[0].id;
    if (user_id.length === 0) {
      return NextResponse.json(
        { error: 'User not registered in database' },
        { status: 404 },
      );
    }
    const [deletedAccount] = await db
      .delete(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, currentUserId)),
      )
      .returning();
    if (!deletedAccount) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Account deleted successfully', deletedAccount },
      { status: 200 },
    );
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
