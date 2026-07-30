import Link from 'next/link';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import { StarRating } from '@/components/shared/StarRating';
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
              <PlaceholderImage gradient={gig.gradient} imageUrl={gig.imageUrl} alt={gig.title} />
              {gig.badge && <div className="gig-card-badge">{gig.badge}</div>}
            </div>
            <div className="profile-gig-body">
              <div className="profile-gig-title">{gig.title}</div>
              <div className="profile-gig-meta">
                <div className="gig-card-rating">
                  <StarRating rating={gig.rating} reviewCount={gig.reviews} showValue size="sm" />
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
