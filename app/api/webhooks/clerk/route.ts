import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyWebhook, WebhookEvent } from '@clerk/nextjs/webhooks';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as WebhookEvent;
    const { data, type } = evt;
    const { id: userIdClerk } = data;
    if (!userIdClerk) {
      throw new Error('Missing clerkUserId in webhook payload');
    }

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const userEmailClerk = data.email_addresses[0]?.email_address || '';
        if (!userEmailClerk) {
          throw new Error('Missing email Address in webhook payload');
        }
        await db
          .insert(users)
          .values({
            clerkUserId: userIdClerk,
            email: userEmailClerk,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          })
          .onConflictDoUpdate({
            target: users.clerkUserId,
            set: {
              email: userEmailClerk,
              firstName: data.first_name,
              lastName: data.last_name,
              imageUrl: data.image_url,
              updatedAt: new Date(),
            },
          });
        break;
      }
      case 'user.deleted': {
        await db.delete(users).where(eq(users.clerkUserId, userIdClerk));
        break;
      }
      default:
        console.log(`Unhandled event type: ${type}`);
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unhandled event type:', error);
    const isSignError =
      error.message.includes('signature') || error.message.includes('webhook');
    return NextResponse.json(
      { error: isSignError ? 'Invalid signature' : 'Internal server error' },
      { status: isSignError ? 400 : 500 },
    );
  }
}
