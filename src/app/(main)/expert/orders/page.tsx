import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import { listExpertOrders } from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Orders | BooSend Experts',
};

export default async function ExpertOrdersPage() {
  const { user, marketplace } = await getCurrentUserContext();
  if (!user || !marketplace) {
    redirect('/become-an-expert');
  }

  if (marketplace.expertProfile?.application_status !== 'approved') {
    redirect('/expert/onboarding');
  }

  const orders = await listExpertOrders(marketplace.account.id);

  return (
    <div className="orders-page" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div className="orders-header">
        <h1 className="orders-title">Expert Orders</h1>
        <p className="orders-subtitle">
          Track incoming buyer work and keep delivery expectations clear.
        </p>
      </div>

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map(({ order, buyerName, buyerEmail }) => (
            <a key={order.id} href={`/orders/${order.id}`} className="order-card">
              <div className="order-card-header">
                <div className="order-card-seller-info">
                  <span className="order-card-seller-name">{buyerName}</span>
                  <span className="order-card-seller-level">{buyerEmail}</span>
                </div>
                <div className={`order-card-status order-card-status--${order.status}`}>
                  {order.status.replace('_', ' ')}
                </div>
              </div>
              <div className="order-card-body">
                <h3 className="order-card-gig-title">{order.gigTitle}</h3>
                <div className="order-card-meta">
                  <span className="order-card-package">{order.packageName} Package</span>
                  <span className="order-card-price">${order.price}</span>
                </div>
                <div className="order-card-dates">
                  <span>Ordered: {order.orderDate}</span>
                  <span>Delivery: {order.deliveryDate}</span>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="orders-empty">No buyer orders yet.</div>
        )}
      </div>
    </div>
  );
}
