'use client';

import { useState, useCallback } from 'react';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import type { Order, Seller, OrderReview } from '@/types';

interface ReviewModalProps {
  order: Order;
  seller: Seller;
  onSubmit: (orderId: number, review: OrderReview) => void;
  onClose: () => void;
}

export function ReviewModal({ order, seller, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    if (rating === 0 || text.trim() === '') return;
    onSubmit(order.id, {
      rating,
      text: text.trim(),
      date: 'Just now',
    });
  }, [rating, text, order.id, onSubmit]);

  const displayRating = hoveredRating || rating;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="review-modal-header">
          <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={48} fontSize="0.9rem" />
          <div>
            <h3 className="review-modal-title">Review {seller.name}</h3>
            <p className="review-modal-gig">{order.gigTitle}</p>
          </div>
        </div>

        <div className="review-modal-rating">
          <label className="review-modal-label">Your Rating</label>
          <div className="review-modal-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`review-modal-star${displayRating >= star ? ' active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="review-modal-field">
          <label className="review-modal-label">Your Review</label>
          <textarea
            className="review-modal-textarea"
            placeholder="Share your experience working with this seller..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <button
          className="review-modal-submit"
          disabled={rating === 0 || text.trim() === ''}
          onClick={handleSubmit}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
