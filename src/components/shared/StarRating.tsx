interface StarRatingProps {
  count?: number;
  rating?: number;
  reviewCount?: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function StarRating({ count, rating, reviewCount, showValue, size = 'md' }: StarRatingProps) {
  // Legacy mode: render exactly N filled stars
  if (count !== undefined && rating === undefined) {
    return (
      <>
        {Array.from({ length: count }, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </>
    );
  }

  const displayRating = rating ?? 0;
  const fullStars = Math.floor(displayRating);
  const hasHalf = displayRating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className={`star-rating star-rating--${size}`}>
      {showValue && displayRating > 0 && (
        <span className="star-rating-value">{displayRating}</span>
      )}
      <span className="star-rating-stars">
        {Array.from({ length: fullStars }, (_, i) => (
          <svg key={`full-${i}`} viewBox="0 0 24 24" fill="currentColor" className="star-filled">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        {hasHalf && (
          <svg viewBox="0 0 24 24" className="star-half">
            <defs>
              <linearGradient id="star-half-grad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path fill="url(#star-half-grad)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <svg key={`empty-${i}`} viewBox="0 0 24 24" fill="#e5e7eb" className="star-empty">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      {reviewCount !== undefined && (
        <span className="star-rating-count">({reviewCount})</span>
      )}
    </span>
  );
}
