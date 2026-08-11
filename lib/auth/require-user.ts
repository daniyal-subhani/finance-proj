import { getCurrentUser } from './current-user';

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
