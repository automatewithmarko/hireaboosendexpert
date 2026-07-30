'use client';

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { StarRating } from '@/components/shared/StarRating';
import { ReviewModal } from './ReviewModal';
import {
  startOrderAction,
  deliverOrderAction,
  acceptDeliveryAction,
  requestRevisionAction,
} from '@/lib/marketplace/actions';
import type { Order, Seller, OrderReview, OrderTimelineEvent } from '@/types';

interface OrderDetailClientProps {
  order: Order;
  seller: Seller;
  timeline: OrderTimelineEvent[];
  viewerRole: 'buyer' | 'expert';
}

function getOrderStatusLabel(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'delivered':
      return 'Delivered';
    case 'revision_requested':
      return 'Revision Requested';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    case 'completed':
    default:
      return 'Completed';
  }
}

function getPaymentBadge(status: string | undefined) {
  switch (status) {
    case 'paid':
      return <span className="payment-badge payment-badge--paid">Paid</span>;
    case 'released':
      return <span className="payment-badge payment-badge--released">Released</span>;
    case 'pending':
      return <span className="payment-badge payment-badge--pending">Processing</span>;
    case 'refunded':
      return <span className="payment-badge payment-badge--refunded">Refunded</span>;
    default:
      return null;
  }
}

export function OrderDetailClient({ order: initialOrder, seller, timeline, viewerRole }: OrderDetailClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [revisionMessage, setRevisionMessage] = useState('');
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pkg = seller.packages.find((p) => p.name === order.packageName) ?? seller.packages[0];
  const serviceFee = order.serviceFee ?? Math.round(order.price * 0.1);
  const total = order.total ?? order.price + serviceFee;

  const handleAction = useCallback((message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 4000);
  }, []);

  const handleSubmitReview = useCallback((orderId: number, review: OrderReview) => {
    setOrder((prev) => ({ ...prev, review }));
    setShowReviewModal(false);
  }, []);

  const handleStartWork = useCallback(() => {
    startTransition(async () => {
      const result = await startOrderAction(order.id);
      if (result.error) {
        handleAction(result.error);
        return;
      }
      setOrder((prev) => ({ ...prev, status: 'in_progress' }));
      handleAction('You have started working on this order.');
    });
  }, [order.id, handleAction]);

  const handleDeliver = useCallback(() => {
    startTransition(async () => {
      const result = await deliverOrderAction({ orderId: order.id, message: deliveryMessage });
      if (result.error) {
        handleAction(result.error);
        return;
      }
      setOrder((prev) => ({ ...prev, status: 'delivered', deliveryStatus: 'submitted' }));
      setShowDeliverForm(false);
      setDeliveryMessage('');
      handleAction('Delivery submitted! Waiting for buyer to review.');
    });
  }, [order.id, deliveryMessage, handleAction]);

  const handleAcceptDelivery = useCallback(() => {
    startTransition(async () => {
      const result = await acceptDeliveryAction(order.id);
      if (result.error) {
        handleAction(result.error);
        return;
      }
      setOrder((prev) => ({ ...prev, status: 'completed', deliveryStatus: 'accepted', paymentStatus: 'released' }));
      handleAction('Delivery accepted! You can now leave a review.');
    });
  }, [order.id, handleAction]);

  const handleRequestRevision = useCallback(() => {
    startTransition(async () => {
      const result = await requestRevisionAction({ orderId: order.id, message: revisionMessage });
      if (result.error) {
        handleAction(result.error);
        return;
      }
      setOrder((prev) => ({ ...prev, status: 'revision_requested', deliveryStatus: 'revision_requested' }));
      setShowRevisionForm(false);
      setRevisionMessage('');
      handleAction('Revision requested. The expert will review your feedback.');
    });
  }, [order.id, revisionMessage, handleAction]);

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
                {getOrderStatusLabel(order.status)}
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
                  <span className="order-detail-package-value">{pkg?.delivery ?? 'Flexible'}</span>
                </div>
                <div className="order-detail-package-row">
                  <span className="order-detail-package-label">Revisions</span>
                  <span className="order-detail-package-value">{pkg?.revisions ?? 1}</span>
                </div>
              </div>
              {pkg && pkg.features.length > 0 && (
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
              )}
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

          {/* Review Section - completed orders, buyer only */}
          {order.status === 'completed' && viewerRole === 'buyer' && (
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
                <path d="M21 12V7H5a2 2 0 010-4h14v4" />
                <path d="M3 5v14a2 2 0 002 2h16v-5" />
                <path d="M18 12a2 2 0 000 4h4v-4h-4z" />
              </svg>
              <div>
                <span className="order-detail-payment-card">BooSend Wallet</span>
                <span className="order-detail-payment-date">
                  {order.paymentStatus ? getPaymentBadge(order.paymentStatus) : `Paid on ${order.orderDate}`}
                </span>
              </div>
            </div>
          </div>

          {/* Order Lifecycle Actions */}
          <div className="order-detail-actions">
            {/* Expert actions */}
            {viewerRole === 'expert' && order.status === 'pending' && (
              <div className="order-lifecycle-actions">
                <button
                  className="order-lifecycle-btn order-lifecycle-btn--primary"
                  onClick={handleStartWork}
                  disabled={isPending}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {isPending ? 'Starting...' : 'Start Working'}
                </button>
              </div>
            )}

            {viewerRole === 'expert' && (order.status === 'in_progress' || order.status === 'revision_requested') && (
              <div className="order-lifecycle-actions">
                {!showDeliverForm ? (
                  <button
                    className="order-lifecycle-btn order-lifecycle-btn--success"
                    onClick={() => setShowDeliverForm(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    Deliver Order
                  </button>
                ) : (
                  <>
                    <textarea
                      className="order-deliver-textarea"
                      value={deliveryMessage}
                      onChange={(e) => setDeliveryMessage(e.target.value)}
                      placeholder="Add a message about the delivery..."
                    />
                    <button
                      className="order-lifecycle-btn order-lifecycle-btn--success"
                      onClick={handleDeliver}
                      disabled={isPending}
                    >
                      {isPending ? 'Delivering...' : 'Submit Delivery'}
                    </button>
                    <button
                      className="order-lifecycle-btn order-lifecycle-btn--warning"
                      onClick={() => setShowDeliverForm(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Buyer actions */}
            {viewerRole === 'buyer' && order.status === 'delivered' && (
              <div className="order-lifecycle-actions">
                <button
                  className="order-lifecycle-btn order-lifecycle-btn--success"
                  onClick={handleAcceptDelivery}
                  disabled={isPending}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {isPending ? 'Accepting...' : 'Accept Delivery'}
                </button>
                {!showRevisionForm ? (
                  <button
                    className="order-lifecycle-btn order-lifecycle-btn--warning"
                    onClick={() => setShowRevisionForm(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 4v6h6M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                    </svg>
                    Request Revision
                  </button>
                ) : (
                  <>
                    <textarea
                      className="order-deliver-textarea"
                      value={revisionMessage}
                      onChange={(e) => setRevisionMessage(e.target.value)}
                      placeholder="Describe what changes you need..."
                    />
                    <button
                      className="order-lifecycle-btn order-lifecycle-btn--warning"
                      onClick={handleRequestRevision}
                      disabled={isPending || !revisionMessage.trim()}
                    >
                      {isPending ? 'Submitting...' : 'Submit Revision Request'}
                    </button>
                    <button
                      className="order-lifecycle-btn order-lifecycle-btn--warning"
                      onClick={() => setShowRevisionForm(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Common actions */}
            <h3 className="order-detail-actions-title">Need Help?</h3>
            <Link href="/inbox" className="order-detail-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {viewerRole === 'buyer' ? 'Contact Seller' : 'Contact Buyer'}
            </Link>
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
