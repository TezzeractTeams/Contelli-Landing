function normalizeIssuer(issuer: string): string {
  return issuer.replace(/\/+$/, '');
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAuthConfig() {
  const issuer = normalizeIssuer(requireEnv('AUTH_ISSUER'));
  const clientId = requireEnv('AUTH_CLIENT_ID');
  const redirectUri = requireEnv('AUTH_REDIRECT_URI');
  const postLogoutRedirectUri = requireEnv('AUTH_POST_LOGOUT_REDIRECT_URI');

  return {
    issuer,
    clientId,
    redirectUri,
    postLogoutRedirectUri,
    authorizeUrl: `${issuer}/authorize`,
    tokenUrl: `${issuer}/token`,
    jwksUrl: `${issuer}/jwks`,
    endSessionUrl: `${issuer}/end_session`,
  };
}
