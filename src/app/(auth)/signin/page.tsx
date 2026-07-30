import { redirect } from 'next/navigation';
import { CustomerSignInPage } from '@/components/auth/CustomerSignInPage';
import { getCurrentUserContext } from '@/lib/auth/session';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | BooSend Experts',
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignIn({ searchParams }: PageProps) {
  const [{ user }, { next }] = await Promise.all([
    getCurrentUserContext(),
    searchParams,
  ]);

  if (user) {
    redirect(next ?? '/');
  }

  return <CustomerSignInPage nextPath={next ?? '/'} />;
}
