'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Package } from '@/types';

export function PricingTable({ packages, isOwnGig }: { packages: Package[]; isOwnGig?: boolean }) {
  const [activeTab, setActiveTab] = useState(packages.length > 1 ? 1 : 0);
  const pkg = packages[activeTab];

  if (!pkg) {
    return null;
  }

  const checkSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
  const clockSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
  const refreshSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 4v6h6" />
      <path d="M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );

  return (
    <div className="pricing-tabbed">
      <div className="pricing-tabs">
        {packages.map((p, i) => (
          <button
            key={p.name}
            className={`pricing-tab${i === activeTab ? ' active' : ''}${i === 1 ? ' popular' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {p.name}
            {i === 1 && <span className="pricing-tab-badge">Popular</span>}
          </button>
        ))}
      </div>
      <div className="pricing-tab-body">
        <div className="pricing-tab-top">
          <div className="pricing-tab-price">${pkg.price}</div>
          <p className="pricing-tab-desc">{pkg.description}</p>
        </div>
        <div className="pricing-tab-details">
          <span className="pricing-tab-detail">{clockSvg}<strong>{pkg.delivery}</strong> delivery</span>
          <span className="pricing-tab-detail">{refreshSvg}<strong>{pkg.revisions}</strong> revision{pkg.revisions > 1 ? 's' : ''}</span>
        </div>
        <ul className="pricing-tab-features">
          {pkg.features.map((f) => (
            <li key={f}>{checkSvg}{f}</li>
          ))}
        </ul>
        {isOwnGig ? (
          <span className="pricing-tab-cta" style={{ opacity: 0.5, cursor: 'default', textAlign: 'center' }}>
            This is your gig
          </span>
        ) : pkg.gigId && pkg.id ? (
          <Link href={`/checkout/${pkg.gigId}?package=${pkg.id}`} className="pricing-tab-cta">
            Select {pkg.name}
          </Link>
        ) : (
          <button className="pricing-tab-cta">Select {pkg.name}</button>
        )}
      </div>
    </div>
  );
}
