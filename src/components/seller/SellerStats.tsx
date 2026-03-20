import type { Seller } from '@/types';

export function SellerStats({ seller }: { seller: Seller }) {
  return (
    <div className="provider-stats">
      <div className="provider-stat">
        <div className="provider-stat-value">{seller.completedOrders}</div>
        <div className="provider-stat-label">Orders Completed</div>
      </div>
      <div className="provider-stat">
        <div className="provider-stat-value">{seller.rating}</div>
        <div className="provider-stat-label">Average Rating</div>
      </div>
      <div className="provider-stat">
        <div className="provider-stat-value">{seller.reviews}</div>
        <div className="provider-stat-label">Total Reviews</div>
      </div>
      <div className="provider-stat">
        <div className="provider-stat-value">{seller.responseTime}</div>
        <div className="provider-stat-label">Response Time</div>
      </div>
    </div>
  );
}
