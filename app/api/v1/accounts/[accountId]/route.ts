import { getCurrentUser } from '@/lib/auth/current-user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = await req.json();
    const user = await getCurrentUser();

    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid credientials' },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error('Invalid User:', { error });
    return NextResponse.json({ error }, { status: 401 });
  }
}
