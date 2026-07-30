'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { publicSupabaseEnv } from './public-env';

let marketplaceBrowserClient:
  | ReturnType<typeof createClient<Database>>
  | undefined;

export function getMarketplaceBrowserClient() {
  marketplaceBrowserClient ??= createClient<Database>(
    publicSupabaseEnv.marketplace.url,
    publicSupabaseEnv.marketplace.anonKey,
    {
      accessToken: async () => {
        const response = await fetch('/api/marketplace/token', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as { token?: string | null };
        return payload.token ?? null;
      },
    },
  );

  return marketplaceBrowserClient;
}
