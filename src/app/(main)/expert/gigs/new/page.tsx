import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import { GigCreationStudio } from '@/components/expert/GigCreationStudio';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Gig | BooSend Experts',
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewGigPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { user, marketplace } = await getCurrentUserContext();
  if (!user || !marketplace) {
    redirect('/become-an-expert');
  }

  if (marketplace.expertProfile?.application_status !== 'approved') {
    redirect('/expert/onboarding');
  }

  return (
    <div className="orders-page" style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div className="orders-header">
        <h1 className="orders-title">Create a Gig</h1>
        <p className="orders-subtitle">
          New gigs start in the review queue. After admin approval they become public.
        </p>
      </div>

      <GigCreationStudio error={params.error} />
    </div>
  );
}
