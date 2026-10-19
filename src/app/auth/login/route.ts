import { NextResponse } from 'next/server';
import { getAuthConfig } from '@/lib/auth/config';
import {
  codeChallengeFromVerifier,
  generateCodeVerifier,
  generateState,
} from '@/lib/auth/pkce';
import { setPkceCookies } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { authorizeUrl, clientId, redirectUri } = getAuthConfig();
  const verifier = generateCodeVerifier();
  const state = generateState();
  const codeChallenge = codeChallengeFromVerifier(verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile offline_access',
    prompt: 'consent',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const response = NextResponse.redirect(`${authorizeUrl}?${params.toString()}`);
  setPkceCookies(response, verifier, state);
  return response;
}
