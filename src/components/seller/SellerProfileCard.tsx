import Link from 'next/link';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import type { Seller } from '@/types';

export function SellerProfileCard({ seller }: { seller: Seller }) {
  return (
    <div className="profile-card">
      <div className="profile-card-top">
        <Link href={`/profile/${seller.id}`} className="profile-card-avatar profile-card-link">
          <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={72} fontSize="1.5rem" />
          {seller.online && <span className="profile-card-online-dot" />}
        </Link>
        <div className="profile-card-info">
          <Link href={`/profile/${seller.id}`} className="profile-card-name profile-card-link">{seller.name}</Link>
          <div className="profile-card-username">{seller.username}</div>
          <div className="profile-card-badges">
            <span className="provider-level-badge">{seller.level}</span>
            {seller.online && <span className="provider-online">Online</span>}
          </div>
        </div>
      </div>

      <div className="profile-card-stats">
        <div className="profile-card-stat">
          <div className="profile-card-stat-value">{seller.completedOrders}</div>
          <div className="profile-card-stat-label">Orders</div>
        </div>
        <div className="profile-card-stat">
          <div className="profile-card-stat-value">{seller.rating}</div>
          <div className="profile-card-stat-label">Rating</div>
        </div>
        <div className="profile-card-stat">
          <div className="profile-card-stat-value">{seller.reviews}</div>
          <div className="profile-card-stat-label">Reviews</div>
        </div>
        <div className="profile-card-stat">
          <div className="profile-card-stat-value">{seller.responseTime}</div>
          <div className="profile-card-stat-label">Response</div>
        </div>
      </div>

      <div className="profile-card-meta">
        <span className="profile-card-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {seller.location}
        </span>
        <span className="profile-card-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Member since {seller.memberSince}
        </span>
      </div>
    </div>
  );
}
