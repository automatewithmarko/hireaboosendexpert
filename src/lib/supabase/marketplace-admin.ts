import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from './env';
import type { Database } from './database.types';

let marketplaceAdminClient:
  | ReturnType<typeof createClient<Database>>
  | undefined;

export function getMarketplaceAdminClient() {
  marketplaceAdminClient ??= createClient<Database>(
    supabaseEnv.marketplace.url,
    supabaseEnv.marketplace.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return marketplaceAdminClient;
}
