import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import type { Seller } from '@/types';

export function SellerHero({ seller }: { seller: Seller }) {
  return (
    <section className="provider-hero">
      <div className="provider-avatar">
        <PlaceholderAvatar initials={seller.avatar} color={seller.avatarColor} size={120} fontSize="2.5rem" />
      </div>
      <div className="provider-hero-info">
        <div className="provider-name">{seller.name}</div>
        <div className="provider-username">{seller.username}</div>
        <div className="provider-meta">
          <span className="provider-level-badge">{seller.level}</span>
          {seller.online && <span className="provider-online">Online</span>}
          <span className="provider-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {seller.location}
          </span>
          <span className="provider-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Responds in {seller.responseTime}
          </span>
        </div>
        <div className="provider-meta" style={{ marginBottom: 0 }}>
          <span className="provider-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Member since {seller.memberSince}
          </span>
        </div>
      </div>
    </section>
  );
}
