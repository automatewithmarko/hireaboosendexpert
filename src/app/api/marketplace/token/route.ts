import { SignJWT } from 'jose';
import { ensureMarketplaceAccount } from '@/lib/auth/session';
import { validateAuthAccessToken } from '@/lib/auth/validate-auth-session';
import { getAuthServerClient } from '@/lib/supabase/auth-server';
import { supabaseEnv } from '@/lib/supabase/env';

export async function POST() {
  const auth = await getAuthServerClient();
  const {
    data: { session },
  } = await auth.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    return Response.json({ error: 'Unauthorized', token: null }, { status: 401 });
  }

  const validation = await validateAuthAccessToken(accessToken);
  if (!validation.valid) {
    return Response.json({ error: 'Unauthorized', token: null }, { status: 401 });
  }

  if (!supabaseEnv.marketplace.jwtSecret) {
    return Response.json(
      {
        error: 'MARKETPLACE_JWT_SECRET is not configured.',
        token: null,
      },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await auth.auth.getUser(accessToken);

  if (!user) {
    return Response.json({ error: 'Unauthorized', token: null }, { status: 401 });
  }

  const marketplace = await ensureMarketplaceAccount(user);
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    role: 'authenticated',
    email: user.email,
    account_roles: marketplace.roles,
    marketplace_account_id: marketplace.account.id,
    expert_application_status: marketplace.expertProfile?.application_status ?? null,
    is_admin: marketplace.isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setIssuer(supabaseEnv.marketplace.url)
    .setAudience('authenticated')
    .setSubject(user.id)
    .setExpirationTime(now + 60 * 5)
    .sign(new TextEncoder().encode(supabaseEnv.marketplace.jwtSecret));

  return Response.json({
    token,
    expiresIn: 300,
    validationMode: validation.mode,
  });
}
