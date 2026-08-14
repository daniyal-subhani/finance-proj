import { db } from '@/db';
import { users } from '@/db/schema';
import { Webhook } from 'svix';
import { env } from '../../../../config/env';
import type { WebhookEvent } from '@clerk/backend';
import { WebhookEventType } from '@clerk/backend';

export async function POST(req: Request) {
  try {
    let evt: WebhookEvent;
    const check = new Webhook(evt);
  } catch (error) {}
}
