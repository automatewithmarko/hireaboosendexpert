import Link from 'next/link';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import { platformColors, platformNames } from '@/data/constants';
import type { Seller } from '@/types';

export function ProfileGigsList({ seller }: { seller: Seller }) {
  return (
    <div className="provider-section">
      <h3>Services ({seller.gigs.length})</h3>
      <div className="profile-gigs-grid">
        {seller.gigs.map((gig, index) => (
          <Link key={index} href={`/listing/${seller.id}`} className="profile-gig-card">
            <div className="profile-gig-image">
              <PlaceholderImage gradient={gig.gradient} />
              {gig.badge && <div className="gig-card-badge">{gig.badge}</div>}
            </div>
            <div className="profile-gig-body">
              <div className="profile-gig-title">{gig.title}</div>
              <div className="profile-gig-meta">
                <div className="gig-card-rating">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="gig-card-rating-score">{gig.rating}</span>
                  <span className="gig-card-rating-count">({gig.reviews})</span>
                </div>
                <div className="profile-gig-price">
                  <small>From </small>${gig.price}
                </div>
              </div>
              <div className="profile-gig-category">
                <div className="gig-card-platform-dot" style={{ background: platformColors[gig.category] || '#000' }} />
                <span className="gig-card-platform-name">{platformNames[gig.category] || gig.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
