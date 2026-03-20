import { OrdersPageClient } from '@/components/orders/OrdersPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Orders | BooSend Experts',
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
