import 'server-only';

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { supabaseEnv } from '@/lib/supabase/env';

const authIssuer = `${supabaseEnv.auth.url}/auth/v1`;
const authJwks = createRemoteJWKSet(
  new URL(`${authIssuer}/.well-known/jwks.json`),
);

export async function validateAuthAccessToken(accessToken: string) {
  try {
    const { payload } = await jwtVerify(accessToken, authJwks, {
      issuer: authIssuer,
      audience: 'authenticated',
    });

    return { valid: true, payload, mode: 'jwks' as const };
  } catch {
    const response = await fetch(`${authIssuer}/user`, {
      headers: {
        apikey: supabaseEnv.auth.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { valid: false, payload: null, mode: 'user-endpoint' as const };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return { valid: true, payload, mode: 'user-endpoint' as const };
  }
}
