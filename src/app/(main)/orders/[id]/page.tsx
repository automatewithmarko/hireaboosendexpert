import { notFound } from 'next/navigation';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';
import { getOrderById, initialOrders } from '@/data/orders';
import { getSellerById } from '@/lib/sellers';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return initialOrders.map((o) => ({ id: String(o.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = getOrderById(Number(id));
  return {
    title: order ? `Order #${order.orderNumber} | BooSend Experts` : 'Order Not Found',
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = getOrderById(Number(id));
  if (!order) notFound();

  const seller = getSellerById(order.sellerId);
  if (!seller) notFound();

  return <OrderDetailClient order={order} seller={seller} />;
}
