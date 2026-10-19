import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAMES, clearPkceCookies, setTokenCookies } from '@/lib/auth/cookies';
import { getAuthConfig } from '@/lib/auth/config';
import { verifyAccessToken } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get(COOKIE_NAMES.oauthState)?.value;
  const verifier = cookieStore.get(COOKIE_NAMES.pkceVerifier)?.value;

  if (!code || !state || !storedState || !verifier || state !== storedState) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 });
  }

  const { tokenUrl, clientId, redirectUri } = getAuthConfig();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier,
  });

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 502 }
    );
  }

  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
  };

  if (!tokens.access_token) {
    return NextResponse.json(
      { error: 'Missing access_token in response' },
      { status: 502 }
    );
  }

  try {
    await verifyAccessToken(tokens.access_token);
  } catch {
    return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  setTokenCookies(response, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    id_token: tokens.id_token,
  });
  clearPkceCookies(response);
  return response;
}
