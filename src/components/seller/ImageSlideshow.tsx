'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Gig } from '@/types';

export function ImageSlideshow({ gigs }: { gigs: Gig[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % gigs.length);
  }, [gigs.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + gigs.length) % gigs.length);
  }, [gigs.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (gigs.length === 0) return null;

  return (
    <div className="slideshow">
      <div className="slideshow-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {gigs.map((gig, i) => (
          <div key={i} className="slideshow-slide" style={{ background: gig.gradient }}>
            <div className="slideshow-slide-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="slideshow-slide-title">{gig.title}</span>
            </div>
            {gig.badge && <span className="slideshow-badge">{gig.badge}</span>}
          </div>
        ))}
      </div>

      {gigs.length > 1 && (
        <>
          <button className="slideshow-arrow slideshow-arrow--prev" onClick={prev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="slideshow-arrow slideshow-arrow--next" onClick={next} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="slideshow-dots">
            {gigs.map((_, i) => (
              <button
                key={i}
                className={`slideshow-dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
