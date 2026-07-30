import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { StarRating } from '@/components/shared/StarRating';
import type { Review } from '@/types';

interface ReviewsListProps {
  reviews: Review[];
  showBreakdown?: boolean;
}

function ReviewBreakdown({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const counts = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    counts[star - 1]++;
    sum += r.rating;
  }
  const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';

  return (
    <div className="review-breakdown">
      <div className="review-breakdown-summary">
        <div className="review-breakdown-avg">{avg}</div>
        <div className="review-breakdown-stars">
          <StarRating count={Math.round(Number(avg))} />
        </div>
        <div className="review-breakdown-total">{total} review{total !== 1 ? 's' : ''}</div>
      </div>
      <div className="review-breakdown-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = counts[star - 1];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="review-breakdown-row">
              <span className="review-breakdown-label">{star} star{star !== 1 ? 's' : ''}</span>
              <div className="review-breakdown-bar-track">
                <div className="review-breakdown-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="review-breakdown-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewsList({ reviews, showBreakdown }: ReviewsListProps) {
  const reviewItems = reviews.map((r, i) => {
    const initials = r.name.split(' ').map((n) => n[0]).join('');
    return (
      <div key={i} className="provider-review">
        <div className="provider-review-header">
          <div className="provider-review-avatar">
            <PlaceholderAvatar initials={initials} color={r.color} size={36} fontSize="0.7rem" />
          </div>
          <span className="provider-review-name">{r.name}</span>
          <div className="provider-review-stars">
            <StarRating count={r.rating} />
          </div>
        </div>
        <p className="provider-review-text">{r.text}</p>
        <div className="provider-review-date">{r.date}</div>
      </div>
    );
  });

  const emptyState = reviews.length === 0 ? (
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
      No reviews yet. Reviews will appear here once buyers complete orders.
    </p>
  ) : null;

  if (!showBreakdown) {
    return (
      <div className="provider-section">
        <h3>Reviews ({reviews.length})</h3>
        {emptyState || reviewItems}
      </div>
    );
  }

  return (
    <div className="provider-section">
      <h3>Reviews ({reviews.length})</h3>
      {emptyState || (
        <div className="reviews-with-breakdown">
          <ReviewBreakdown reviews={reviews} />
          <div className="reviews-list-column">
            {reviewItems}
          </div>
        </div>
      )}
    </div>
  );
}
