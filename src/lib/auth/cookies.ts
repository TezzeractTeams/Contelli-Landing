import { NextResponse } from 'next/server';

type CookieOpts = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
};

export const COOKIE_NAMES = {
  pkceVerifier: 'pkce_verifier',
  oauthState: 'oauth_state',
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  idToken: 'id_token',
} as const;

const PKCE_MAX_AGE = 600;
const DEFAULT_ACCESS_MAX_AGE = 900;

function baseCookieOptions(maxAge: number): CookieOpts {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

function maxAgeFromJwtExp(token: string, fallback: number): number {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return fallback;
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8')
    ) as { exp?: number };
    if (typeof payload.exp !== 'number') return fallback;
    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : fallback;
  } catch {
    return fallback;
  }
}

export function setPkceCookies(
  response: NextResponse,
  verifier: string,
  state: string
): void {
  const opts = baseCookieOptions(PKCE_MAX_AGE);
  response.cookies.set(COOKIE_NAMES.pkceVerifier, verifier, opts);
  response.cookies.set(COOKIE_NAMES.oauthState, state, opts);
}

export function clearPkceCookies(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAMES.pkceVerifier);
  response.cookies.delete(COOKIE_NAMES.oauthState);
}

export function setTokenCookies(
  response: NextResponse,
  tokens: {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
  }
): void {
  const accessMaxAge = maxAgeFromJwtExp(
    tokens.access_token,
    DEFAULT_ACCESS_MAX_AGE
  );
  response.cookies.set(
    COOKIE_NAMES.accessToken,
    tokens.access_token,
    baseCookieOptions(accessMaxAge)
  );

  if (tokens.refresh_token) {
    response.cookies.set(
      COOKIE_NAMES.refreshToken,
      tokens.refresh_token,
      baseCookieOptions(60 * 60 * 24 * 30)
    );
  }

  if (tokens.id_token) {
    const idMaxAge = maxAgeFromJwtExp(tokens.id_token, accessMaxAge);
    response.cookies.set(
      COOKIE_NAMES.idToken,
      tokens.id_token,
      baseCookieOptions(idMaxAge)
    );
  }
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAMES.accessToken);
  response.cookies.delete(COOKIE_NAMES.refreshToken);
  response.cookies.delete(COOKIE_NAMES.idToken);
  clearPkceCookies(response);
}
