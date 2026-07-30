import { NextResponse } from 'next/server';
import { getAuthServerClient } from '@/lib/supabase/auth-server';

export async function GET(request: Request) {
  const auth = await getAuthServerClient();
  await auth.auth.signOut();

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
