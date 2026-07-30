'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicSupabaseEnv } from './public-env';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getAuthBrowserClient() {
  browserClient ??= createBrowserClient(
    publicSupabaseEnv.auth.url,
    publicSupabaseEnv.auth.anonKey,
  );

  return browserClient;
}
