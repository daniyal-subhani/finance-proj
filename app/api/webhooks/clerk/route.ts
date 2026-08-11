import { db } from '@/db';
import { users } from '@/db/schema';
import { Webhook } from 'svix';
import { env } from '../../../../config/env';

export async function POSt(req: Request) {
  // web hook secret
  const secret = env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json(
      { message: 'Webhook secret missing' },
      { status: 500 },
    );
  }
  // clerk/Svix headers
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixSignature || !svixTimestamp) {
    return Response.json(
      { message: 'Missing webhook headers' },
      { status: 400 },
    );
  }
  // raw request body
  const body = await req.text();
  // Clerk webhook verify kro
  const webhook = new Webhook(secret);
  let event;
  try {
    // verify request
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return Response.json(
      {
        message: 'Invalid webhook signature',
      },
      { status: 401 },
    );
  }
  // event check
  if (event.type === 'user.created') {
    const clerkUserId = event.data.id;

    // save user
    await db.insert(users).values({
      clerkUserId,
    });
  }
  // tell clerk that we successfully processed it
  return Response.json({ success: true });
}
