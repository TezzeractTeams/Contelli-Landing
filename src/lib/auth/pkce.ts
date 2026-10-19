import { createHash, randomBytes } from 'crypto';

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

export function codeChallengeFromVerifier(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

export function generateState(): string {
  return base64UrlEncode(randomBytes(32));
}
