import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET() {
  const accessToken = cookies().get(COOKIE_NAMES.accessToken)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const claims = await verifyAccessToken(accessToken);
    return NextResponse.json({ claims });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
