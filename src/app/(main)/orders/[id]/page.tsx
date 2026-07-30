import { notFound, redirect } from 'next/navigation';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';
import { getCurrentUserContext } from '@/lib/auth/session';
import { getOrderDetailById } from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Order Details | BooSend Experts',
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user, marketplace } = await getCurrentUserContext();
  if (!user || !marketplace) {
    redirect(`/signin?next=/orders/${id}`);
  }

  const detail = await getOrderDetailById(
    Number(id),
    marketplace.account.id,
    marketplace.isAdmin,
  );
  if (!detail) notFound();

  const viewerRole = detail.order.sellerAccountId === marketplace.account.id ? 'expert' : 'buyer';

  return (
    <OrderDetailClient
      order={detail.order}
      seller={detail.seller}
      timeline={detail.timeline}
      viewerRole={viewerRole as 'buyer' | 'expert'}
    />
  );
}
