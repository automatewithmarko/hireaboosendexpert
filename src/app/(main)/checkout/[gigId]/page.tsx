import { notFound, redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import { getPublishedGigById } from '@/lib/marketplace/repository';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | BooSend Experts',
};

interface PageProps {
  params: Promise<{ gigId: string }>;
  searchParams: Promise<{ package?: string; error?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const [{ gigId }, packageParams] = await Promise.all([params, searchParams]);
  const detail = await getPublishedGigById(Number(gigId));
  if (!detail) {
    notFound();
  }

  const { user, marketplace } = await getCurrentUserContext();
  const nextPath = `/checkout/${gigId}${packageParams.package ? `?package=${packageParams.package}` : ''}`;
  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  }

  // Prevent purchasing own gig
  if (marketplace && detail.seller.accountId === marketplace.account.id) {
    redirect(`/listing/${detail.seller.id}`);
  }

  const selectedPackageId = Number(packageParams.package ?? detail.packages[0]?.id ?? 0);

  return (
    <CheckoutClient
      gig={detail.gig}
      seller={detail.seller}
      packages={detail.packages}
      selectedPackageId={selectedPackageId}
    />
  );
}
