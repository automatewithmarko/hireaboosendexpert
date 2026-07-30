import { NextResponse } from 'next/server';
import { getAuthServerClient } from '@/lib/supabase/auth-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const redirectPath = next && next.startsWith('/') ? next : '/';

  if (code) {
    const auth = await getAuthServerClient();
    await auth.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
