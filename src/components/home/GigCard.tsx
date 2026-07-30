'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { PlaceholderAvatar } from '@/components/shared/PlaceholderAvatar';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import { StarRating } from '@/components/shared/StarRating';
import { platformColors, platformNames } from '@/data/constants';
import type { GigWithSeller } from '@/types';

interface GigCardProps {
  gig: GigWithSeller;
  index?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function GigCard({ gig, index = 0 }: GigCardProps) {
  const reduce = useReducedMotion();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  const initial = reduce ? false : { opacity: 0, y: 16 };
  const animate = reduce ? undefined : { opacity: 1, y: 0 };
  const transition = reduce
    ? undefined
    : { duration: 0.45, ease: EASE, delay: Math.min(index, 8) * 0.04 };

  return (
    <motion.div
      className="gig-card-wrap"
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <Link href={`/listing/${gig.seller.id}`} className="gig-card">
        <div className="gig-card-image">
          <PlaceholderImage gradient={gig.gradient} imageUrl={gig.imageUrl} alt={gig.title} />
          {gig.badge && <div className="gig-card-badge">{gig.badge}</div>}
          <motion.button
            type="button"
            className={`gig-card-save${saved ? ' is-saved' : ''}`}
            onClick={handleSave}
            whileTap={{ scale: reduce ? 1 : 0.85 }}
            aria-label={saved ? 'Remove from saved' : 'Save expert'}
            aria-pressed={saved}
          >
            <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>
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
            <StarRating rating={gig.rating} reviewCount={gig.reviews} showValue size="sm" />
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
    </motion.div>
  );
}
