'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HeroGridCanvas } from './HeroGridCanvas';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Hero({ searchQuery, onSearchChange }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const scrollToResults = () => {
    const bar = document.getElementById('categoriesBar');
    if (bar) bar.scrollIntoView({ behavior: 'smooth' });
  };

  const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.6, ease: EASE_OUT_EXPO },
    }),
  };

  return (
    <section className="hero" id="heroSection" ref={heroRef}>
      <HeroGridCanvas heroRef={heroRef} />
      <div className="hero-content">
        <motion.div
          className="hero-eyebrow"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <span className="hero-eyebrow-dot" aria-hidden />
          BooSend-certified · Trusted by 2,400+ founders
        </motion.div>

        <motion.h1 initial="hidden" animate="show" custom={1} variants={fadeUp}>
          Find the Perfect<br />
          <span className="highlight">Automation Expert</span>
        </motion.h1>

        <motion.p initial="hidden" animate="show" custom={2} variants={fadeUp}>
          DM automation can sell for you 24/7 — you just need someone who can build one that actually converts. Browse certified experts, hire with confidence, only pay when the work is done.
        </motion.p>

        <motion.div
          className="hero-search"
          initial="hidden"
          animate="show"
          custom={3}
          variants={fadeUp}
        >
          <input
            type="text"
            placeholder='Try "WhatsApp lead capture" or "Instagram DM bot"'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search experts"
          />
          <motion.button
            className="hero-search-btn"
            onClick={scrollToResults}
            whileHover={{ scale: reduce ? 1 : 1.03 }}
            whileTap={{ scale: reduce ? 1 : 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Search
          </motion.button>
        </motion.div>

        <motion.div
          className="hero-trust"
          initial="hidden"
          animate="show"
          custom={4}
          variants={fadeUp}
          aria-label="Marketplace stats"
        >
          <div className="hero-trust-item">
            <span className="hero-trust-num">2,400+</span> experts vetted
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-num">$4.8M</span> paid out
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-num">4.9★</span> avg rating
          </div>
        </motion.div>
      </div>
    </section>
  );
}
