'use client';

import { useRef } from 'react';
import { HeroGridCanvas } from './HeroGridCanvas';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Hero({ searchQuery, onSearchChange }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);

  const scrollToResults = () => {
    const bar = document.getElementById('categoriesBar');
    if (bar) bar.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="heroSection" ref={heroRef}>
      <HeroGridCanvas heroRef={heroRef} />
      <div className="hero-content">
        <h1>Find the Perfect<br />Automation Expert</h1>
        <p>You know DM automation can sell for you 24/7. You just need someone who can build one that actually converts. Browse BooSend-certified experts, hire with confidence, and only pay when the work is done.</p>
        <div className="hero-search">
          <input
            type="text"
            placeholder='Try "WhatsApp lead capture" or "Instagram DM bot"'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="hero-search-btn" onClick={scrollToResults}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
