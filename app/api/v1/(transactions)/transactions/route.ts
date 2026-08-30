import { db } from '@/db';
import { users } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string; transactionId: string }> },
) {
  try {
    const { userId: clerk_user_id } = await auth.protect();
    const { requestedUserId } = await req.json();
    const { accountId, transactionId } = await params;
    if (!clerk_user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.clerkUserId, clerk_user_id),
          eq(users.id, requestedUserId),
        ),
      );
    if (user.length === 0) {
      return NextResponse.json({ error: 'User Not found' }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!transactionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
