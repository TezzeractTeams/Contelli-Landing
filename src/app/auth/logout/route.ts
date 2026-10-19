import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAMES, clearAuthCookies } from '@/lib/auth/cookies';
import { getAuthConfig } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const idTokenHint = cookies().get(COOKIE_NAMES.idToken)?.value;
  const { endSessionUrl, postLogoutRedirectUri } = getAuthConfig();

  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  if (idTokenHint) {
    params.set('id_token_hint', idTokenHint);
  }

  const response = NextResponse.redirect(
    `${endSessionUrl}?${params.toString()}`
  );
  clearAuthCookies(response);
  return response;
}
