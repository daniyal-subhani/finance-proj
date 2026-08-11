import { db } from '@/db';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';

export async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });
  return user ?? null;
}
