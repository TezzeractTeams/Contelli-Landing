import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { getAuthConfig } from './config';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const { jwksUrl } = getAuthConfig();
    jwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return jwks;
}

/** JWT claims are a ~15 minute hint only; not authoritative for sensitive authorization. */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { issuer, clientId } = getAuthConfig();
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer,
    audience: clientId,
  });
  return payload;
}
