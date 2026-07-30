import 'server-only';

import type { User } from '@supabase/supabase-js';
import { getAuthServerClient } from '@/lib/supabase/auth-server';
import { getMarketplaceAdminClient } from '@/lib/supabase/marketplace-admin';
import { supabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/database.types';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type AccountRoleRow = Database['public']['Tables']['account_roles']['Row'];
type ExpertProfileRow = Database['public']['Tables']['expert_profiles']['Row'];

export interface MarketplaceAccountContext {
  account: AccountRow;
  roles: AccountRoleRow['role'][];
  expertProfile: ExpertProfileRow | null;
  isAdmin: boolean;
}

function getUserDisplayName(user: User) {
  return (
    (typeof user.user_metadata?.full_name === 'string' &&
      user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    user.email ||
    'BooSend User'
  );
}

async function ensureDefaultCustomerRole(accountId: string) {
  const marketplace = getMarketplaceAdminClient();

  await marketplace.from('account_roles').upsert({
    account_id: accountId,
    role: 'customer',
  });

  await marketplace.from('customer_profiles').upsert({
    account_id: accountId,
    display_name: null,
    tagline: null,
  });
}

export async function ensureMarketplaceAccount(user: User) {
  const marketplace = getMarketplaceAdminClient();
  const accountId = user.id;

  const accountPayload = {
    id: accountId,
    auth_user_id: accountId,
    auth_project_ref: 'hrtzzkvphihafvrmzrrw',
    email: user.email ?? '',
    full_name: getUserDisplayName(user),
    avatar_url:
      typeof user.user_metadata?.avatar_url === 'string'
        ? user.user_metadata.avatar_url
        : null,
    last_seen_at: new Date().toISOString(),
  };

  const { data: account, error } = await marketplace
    .from('accounts')
    .upsert(accountPayload)
    .select('*')
    .single();

  if (error || !account) {
    throw new Error(error?.message ?? 'Unable to bootstrap marketplace account');
  }

  await ensureDefaultCustomerRole(accountId);

  const [{ data: roleRows, error: rolesError }, { data: expertProfile }] =
    await Promise.all([
      marketplace
        .from('account_roles')
        .select('*')
        .eq('account_id', accountId),
      marketplace
        .from('expert_profiles')
        .select('*')
        .eq('account_id', accountId)
        .maybeSingle(),
    ]);

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const roles = (roleRows ?? []).map((row) => row.role);
  const isAdmin =
    roles.includes('admin') ||
    (user.email
      ? supabaseEnv.admin.emails.includes(user.email.toLowerCase())
      : false);

  if (isAdmin && !roles.includes('admin')) {
    await marketplace.from('account_roles').upsert({
      account_id: accountId,
      role: 'admin',
    });
    roles.push('admin');
  }

  return {
    account,
    roles,
    expertProfile: expertProfile ?? null,
    isAdmin,
  } satisfies MarketplaceAccountContext;
}

export async function getCurrentUserContext() {
  const auth = await getAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return {
      user: null,
      marketplace: null,
    };
  }

  const marketplace = await ensureMarketplaceAccount(user);

  return {
    user,
    marketplace,
  };
}
