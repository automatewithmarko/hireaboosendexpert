'use client';

const requiredPublic = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const publicSupabaseEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  auth: {
    url: requiredPublic(
      'NEXT_PUBLIC_AUTH_SUPABASE_URL',
      process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL,
    ),
    anonKey: requiredPublic(
      'NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY,
    ),
  },
  marketplace: {
    url: requiredPublic(
      'NEXT_PUBLIC_MARKETPLACE_SUPABASE_URL',
      process.env.NEXT_PUBLIC_MARKETPLACE_SUPABASE_URL,
    ),
    anonKey: requiredPublic(
      'NEXT_PUBLIC_MARKETPLACE_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_MARKETPLACE_SUPABASE_ANON_KEY,
    ),
  },
};
