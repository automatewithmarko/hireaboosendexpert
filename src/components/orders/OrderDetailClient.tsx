'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { StarRating } from '@/components/shared/StarRating';
import { ReviewModal } from './ReviewModal';
import { getOrderTimeline } from '@/data/orders';
import type { Order, Seller, OrderReview, OrderTimelineEvent } from '@/types';

interface OrderDetailClientProps {
  order: Order;
  seller: Seller;
}

export function OrderDetailClient({ order: initialOrder, seller }: OrderDetailClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const timeline = getOrderTimeline(order);
  const pkg = seller.packages.find((p) => p.name === order.packageName) ?? seller.packages[0];
  const serviceFee = Math.round(order.price * 0.1);
  const total = order.price + serviceFee;

  const handleAction = useCallback((message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 4000);
  }, []);

  const handleSubmitReview = useCallback((orderId: number, review: OrderReview) => {
    setOrder((prev) => ({ ...prev, review }));
    setShowReviewModal(false);
  }, []);

  return (
    <div className="order-detail">
      {actionFeedback && (
        <div className="order-detail-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          {actionFeedback}
        </div>
      )}

      <Link href="/orders" className="order-detail-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Your Orders
      </Link>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          {/* Order Header */}
          <div className="order-detail-header">
            <div className="order-detail-header-top">
              <h1 className="order-detail-order-number">#{order.orderNumber}</h1>
              <div className={`order-card-status order-card-status--${order.status}`}>
                {order.status === 'pending' && 'Pending'}
                {order.status === 'in_progress' && 'In Progress'}
                {order.status === 'completed' && 'Completed'}
              </div>
            </div>
            <div className="order-detail-dates">
              <span>Ordered: {order.orderDate}</span>
              <span className="order-detail-dates-dot" />
              <span>Delivery: {order.deliveryDate}</span>
            </div>
          </div>

          {/* Service Details */}
          <div className="order-detail-service">
            <h2 className="order-detail-section-title">Service Details</h2>
            <div className="order-detail-service-card">
              <div className="order-detail-service-seller">
                <Link href={`/profile/${seller.id}`} className="order-detail-seller-link">
                  <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={44} fontSize="0.8rem" />
                  <div>
                    <span className="order-detail-seller-name">{seller.name}</span>
                    <span className="order-detail-seller-level">{seller.level}</span>
                  </div>
                </Link>
              </div>
              <h3 className="order-detail-gig-title">{order.gigTitle}</h3>
              <div className="order-detail-package-info">
                <div className="order-detail-package-row">
                  <span className="order-detail-package-label">Package</span>
                  <span className="order-detail-package-value">{order.packageName}</span>
                </div>
                <div className="order-detail-package-row">
                  <span className="order-detail-package-label">Delivery Time</span>
                  <span className="order-detail-package-value">{pkg.delivery}</span>
                </div>
                <div className="order-detail-package-row">
                  <span className="order-detail-package-label">Revisions</span>
                  <span className="order-detail-package-value">{pkg.revisions}</span>
                </div>
              </div>
              <div className="order-detail-features">
                <span className="order-detail-features-title">What&apos;s Included</span>
                <ul className="order-detail-features-list">
                  {pkg.features.map((f) => (
                    <li key={f}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="order-detail-timeline-section">
            <h2 className="order-detail-section-title">Order Timeline</h2>
            <div className="order-detail-timeline">
              {timeline.map((event: OrderTimelineEvent, i: number) => (
                <div key={i} className={`order-detail-timeline-step order-detail-timeline-step--${event.status}`}>
                  <div className="order-detail-timeline-dot" />
                  {i < timeline.length - 1 && <div className="order-detail-timeline-line" />}
                  <div className="order-detail-timeline-content">
                    <span className="order-detail-timeline-label">{event.label}</span>
                    {event.date && <span className="order-detail-timeline-date">{event.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Section - completed orders only */}
          {order.status === 'completed' && (
            <div className="order-detail-review-section">
              <h2 className="order-detail-section-title">Your Review</h2>
              {order.review ? (
                <div className="order-detail-review">
                  <div className="order-detail-review-stars">
                    <StarRating count={order.review.rating} />
                    <span className="order-detail-review-date">{order.review.date}</span>
                  </div>
                  <p className="order-detail-review-text">{order.review.text}</p>
                </div>
              ) : (
                <button className="order-detail-review-btn" onClick={() => setShowReviewModal(true)}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Leave a Review
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="order-detail-sidebar">
          {/* Payment Summary */}
          <div className="order-detail-payment">
            <h3 className="order-detail-payment-title">Payment Summary</h3>
            <div className="order-detail-payment-rows">
              <div className="order-detail-payment-row">
                <span>Subtotal</span>
                <span>${order.price}</span>
              </div>
              <div className="order-detail-payment-row">
                <span>Service Fee</span>
                <span>${serviceFee}</span>
              </div>
              <div className="order-detail-payment-row order-detail-payment-total">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
            <div className="order-detail-payment-method">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <path d="M1 10h22" />
              </svg>
              <div>
                <span className="order-detail-payment-card">Visa ending in 4242</span>
                <span className="order-detail-payment-date">Paid on {order.orderDate}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="order-detail-actions">
            <h3 className="order-detail-actions-title">Need Help?</h3>
            <Link href="/inbox" className="order-detail-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Contact Seller
            </Link>
            {order.status !== 'completed' ? (
              <button
                className="order-detail-action-btn order-detail-action-btn--danger"
                onClick={() => handleAction('Cancellation request submitted. The seller will review your request within 24 hours.')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                Request to Cancel
              </button>
            ) : (
              <button
                className="order-detail-action-btn order-detail-action-btn--danger"
                onClick={() => handleAction('Refund request submitted. Our team will review and respond within 48 hours.')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 10h10a5 5 0 010 10H9M3 10l4-4M3 10l4 4" />
                </svg>
                Request a Refund
              </button>
            )}
            <button
              className="order-detail-action-btn order-detail-action-btn--secondary"
              onClick={() => handleAction('Support ticket created. A team member will reach out to you shortly.')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          order={order}
          seller={seller}
          onSubmit={handleSubmitReview}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
