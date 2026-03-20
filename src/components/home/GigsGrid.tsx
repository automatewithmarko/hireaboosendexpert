'use client';

import { GigCard } from './GigCard';
import type { GigWithSeller } from '@/types';

interface GigsGridProps {
  gigs: GigWithSeller[];
}

export function GigsGrid({ gigs }: GigsGridProps) {
  if (gigs.length === 0) {
    return (
      <div className="gigs-grid">
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round" style={{ margin: '0 auto 1rem' }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>No services found</h3>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Try adjusting your search or browse all categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gigs-grid">
      {gigs.map((gig, i) => (
        <GigCard key={`${gig.seller.id}-${i}`} gig={gig} />
      ))}
    </div>
  );
}
