import { redirect } from 'next/navigation';
import { OrdersPageClient } from '@/components/orders/OrdersPageClient';
import { getCurrentUserContext } from '@/lib/auth/session';
import { listCustomerOrders } from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Orders | BooSend Experts',
};

export default async function OrdersPage() {
  const { user, marketplace } = await getCurrentUserContext();
  if (!user || !marketplace) {
    redirect('/signin?next=/orders');
  }

  const orders = await listCustomerOrders(marketplace.account.id);

  return <OrdersPageClient initialOrders={orders} />;
}
