import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from './env';

export async function getAuthServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseEnv.auth.url, supabaseEnv.auth.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Middleware is responsible for refreshing cookies during SSR.
        }
      },
    },
  });
}
