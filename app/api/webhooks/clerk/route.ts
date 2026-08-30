import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyWebhook, WebhookEvent } from '@clerk/nextjs/webhooks';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as WebhookEvent;

    switch (evt.type) {
      case 'user.created':
      case 'user.updated': {
        const data = evt.data;
        const clerkUserId = data.id;
        const userEmailClerk = data.email_addresses[0]?.email_address;
        if (!clerkUserId || !userEmailClerk) {
          throw new Error(
            'Missing clerkId or email Address in webhook payload',
          );
        }
        await db
          .insert(users)
          .values({
            clerkUserId,
            email: userEmailClerk,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: users.clerkUserId,
            set: {
              email: userEmailClerk,
              firstName: data.first_name,
              lastName: data.last_name,
              imageUrl: data.image_url,
              updatedAt: new Date(),
              isActive: true,
              deletedAt: null,
            },
          });
        break;
      }
      case 'session.created': {
        const data = evt.data;
        const clerkUserId = data.id;
        if (!clerkUserId) {
          throw new Error('Missing user_id in session payload');
        }
        const existingUser = await db.query.users.findFirst({
          where: eq(users.clerkUserId, clerkUserId),
        });
        if (!existingUser) {
          await db
            .insert(users)
            .values({
              clerkUserId,
              email: '',
              isActive: true,
            })
            .onConflictDoNothing();
        }
        break;
      }
      case 'user.deleted': {
        const data = evt.data;
        const clerkUserId = data.id;
        if (clerkUserId) {
          await db
            .update(users)
            .set({
              deletedAt: new Date(),
              isActive: false,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkUserId, clerkUserId));
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${evt.type}`);
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
