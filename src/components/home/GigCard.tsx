import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import { platformColors, platformNames } from '@/data/constants';
import type { GigWithSeller } from '@/types';

interface GigCardProps {
  gig: GigWithSeller;
}

export function GigCard({ gig }: GigCardProps) {
  return (
    <Link href={`/listing/${gig.seller.id}`} className="gig-card">
      <div className="gig-card-image">
        <PlaceholderImage gradient={gig.gradient} />
        {gig.badge && <div className="gig-card-badge">{gig.badge}</div>}
        <button className="gig-card-save" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="gig-card-body">
        <div className="gig-card-seller">
          <div className="gig-card-avatar">
            <PlaceholderAvatar initials={gig.seller.avatar} color={gig.seller.avatarColor} size={32} fontSize="0.7rem" />
          </div>
          <div className="gig-card-seller-info">
            <div className="gig-card-seller-name">{gig.seller.name}</div>
            <div className="gig-card-seller-level">{gig.seller.level}</div>
          </div>
        </div>
        <div className="gig-card-title">{gig.title}</div>
        <div className="gig-card-rating">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="gig-card-rating-score">{gig.rating}</span>
          <span className="gig-card-rating-count">({gig.reviews})</span>
        </div>
        <div className="gig-card-footer">
          <div className="gig-card-platform">
            <div className="gig-card-platform-dot" style={{ background: platformColors[gig.category] || '#000' }}></div>
            <span className="gig-card-platform-name">{platformNames[gig.category] || gig.category}</span>
          </div>
          <div className="gig-card-price"><small>From </small>${gig.price}</div>
        </div>
      </div>
    </Link>
  );
}
