import type { Order, OrderTimelineEvent } from '@/types';

export const initialOrders: Order[] = [
  // Active orders
  {
    id: 1,
    orderNumber: 'ORD-001',
    sellerId: 4,
    gigTitle: 'Custom AI agent with memory and tool integration on BooSend',
    packageName: 'Standard',
    price: 600,
    status: 'in_progress',
    orderDate: 'Mar 8, 2026',
    deliveryDate: 'Mar 18, 2026',
    progress: 65,
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    sellerId: 1,
    gigTitle: 'Complete WhatsApp lead capture & nurture automation',
    packageName: 'Standard',
    price: 350,
    status: 'pending',
    orderDate: 'Mar 15, 2026',
    deliveryDate: 'Mar 20, 2026',
    progress: 0,
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    sellerId: 6,
    gigTitle: 'Abandoned cart recovery automations via WhatsApp for your store',
    packageName: 'Standard',
    price: 280,
    status: 'in_progress',
    orderDate: 'Mar 3, 2026',
    deliveryDate: 'Mar 8, 2026',
    progress: 90,
  },

  // Past orders
  {
    id: 4,
    orderNumber: 'ORD-004',
    sellerId: 8,
    gigTitle: 'Connect BooSend to any API, tool, or database in your stack',
    packageName: 'Standard',
    price: 300,
    status: 'completed',
    orderDate: 'Feb 10, 2026',
    deliveryDate: 'Feb 15, 2026',
    progress: 100,
    review: {
      rating: 5,
      text: 'Lisa connected all our tools flawlessly. The documentation she provided was exceptional and the integration has been running perfectly.',
      date: 'Feb 16, 2026',
    },
  },
  {
    id: 5,
    orderNumber: 'ORD-005',
    sellerId: 2,
    gigTitle: 'Instagram DM automation funnel that converts followers to buyers',
    packageName: 'Premium',
    price: 350,
    status: 'completed',
    orderDate: 'Jan 20, 2026',
    deliveryDate: 'Jan 27, 2026',
    progress: 100,
  },
  {
    id: 6,
    orderNumber: 'ORD-006',
    sellerId: 3,
    gigTitle: 'Telegram bot with automated onboarding and engagement flows',
    packageName: 'Basic',
    price: 120,
    status: 'completed',
    orderDate: 'Dec 15, 2025',
    deliveryDate: 'Dec 18, 2025',
    progress: 100,
  },
];

export function getOrderById(id: number): Order | undefined {
  return initialOrders.find((o) => o.id === id);
}

export function getOrderTimeline(order: Order): OrderTimelineEvent[] {
  if (order.status === 'pending') {
    return [
      { label: 'Order Placed', date: order.orderDate, status: 'done' },
      { label: 'Waiting for Seller', date: '', status: 'current' },
      { label: 'In Progress', date: '', status: 'upcoming' },
      { label: 'Delivered', date: order.deliveryDate, status: 'upcoming' },
    ];
  }
  if (order.status === 'in_progress') {
    return [
      { label: 'Order Placed', date: order.orderDate, status: 'done' },
      { label: 'Seller Confirmed', date: order.orderDate, status: 'done' },
      { label: 'In Progress', date: '', status: 'current' },
      { label: 'Delivery Expected', date: order.deliveryDate, status: 'upcoming' },
    ];
  }
  // completed
  return [
    { label: 'Order Placed', date: order.orderDate, status: 'done' },
    { label: 'Seller Confirmed', date: order.orderDate, status: 'done' },
    { label: 'Work Completed', date: '', status: 'done' },
    { label: 'Delivered', date: order.deliveryDate, status: 'done' },
  ];
}
