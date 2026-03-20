import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { StarRating } from '@/components/shared/StarRating';
import type { Order, Seller } from '@/types';

interface OrderCardProps {
  order: Order;
  seller: Seller;
  onLeaveReview?: (orderId: number) => void;
}

export function OrderCard({ order, seller }: OrderCardProps) {
  return (
    <Link href={`/orders/${order.id}`} className="order-card">
      <div className="order-card-header">
        <div className="order-card-seller">
          <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={44} fontSize="0.8rem" />
          <div className="order-card-seller-info">
            <span className="order-card-seller-name">{seller.name}</span>
            <span className="order-card-seller-level">{seller.level}</span>
          </div>
        </div>
        <div className={`order-card-status order-card-status--${order.status}`}>
          {order.status === 'pending' && 'Pending'}
          {order.status === 'in_progress' && 'In Progress'}
          {order.status === 'completed' && 'Completed'}
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

      {order.status === 'completed' && order.review && (
        <div className="order-card-footer">
          <div className="order-card-review">
            <div className="order-card-review-stars">
              <StarRating count={order.review.rating} />
            </div>
            <p className="order-card-review-text">{order.review.text}</p>
          </div>
        </div>
      )}
    </Link>
  );
}
