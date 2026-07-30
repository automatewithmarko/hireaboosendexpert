import { redirect } from 'next/navigation';
import { SignInPage } from '@/components/auth/SignInPage';
import { getCurrentUserContext } from '@/lib/auth/session';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become an Expert | BooSend Experts',
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignIn({ searchParams }: PageProps) {
  const [{ user, marketplace }, { next }] = await Promise.all([
    getCurrentUserContext(),
    searchParams,
  ]);

  if (user) {
    redirect(
      next ??
        (marketplace?.expertProfile?.application_status === 'approved'
          ? '/expert/dashboard'
          : '/expert/onboarding'),
    );
  }

  return <SignInPage nextPath={next ?? '/expert/onboarding'} />;
}
