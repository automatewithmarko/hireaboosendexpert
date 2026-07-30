import 'server-only';

const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const supabaseEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  auth: {
    url: required(
      'NEXT_PUBLIC_AUTH_SUPABASE_URL',
      process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL,
    ),
    anonKey: required(
      'NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY,
    ),
    serviceRoleKey: required(
      'AUTH_SUPABASE_SERVICE_ROLE_KEY',
      process.env.AUTH_SUPABASE_SERVICE_ROLE_KEY,
    ),
  },
  marketplace: {
    url: required(
      'NEXT_PUBLIC_MARKETPLACE_SUPABASE_URL',
      process.env.NEXT_PUBLIC_MARKETPLACE_SUPABASE_URL,
    ),
    anonKey: required(
      'NEXT_PUBLIC_MARKETPLACE_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_MARKETPLACE_SUPABASE_ANON_KEY,
    ),
    serviceRoleKey: required(
      'MARKETPLACE_SUPABASE_SERVICE_ROLE_KEY',
      process.env.MARKETPLACE_SUPABASE_SERVICE_ROLE_KEY,
    ),
    jwtSecret: process.env.MARKETPLACE_JWT_SECRET ?? '',
  },
  admin: {
    emails: (process.env.MARKETPLACE_ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  },
};
