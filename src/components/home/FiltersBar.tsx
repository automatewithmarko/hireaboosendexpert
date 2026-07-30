'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { SortOption } from '@/hooks/useGigFilters';

interface FiltersBarProps {
  resultCount: number;
  minRating: number | null;
  setMinRating: (v: number | null) => void;
  maxDeliveryDays: number | null;
  setMaxDeliveryDays: (v: number | null) => void;
  priceRange: [number, number] | null;
  setPriceRange: (v: [number, number] | null) => void;
  priceBounds: { min: number; max: number };
  allPrices: number[];
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
}

const HISTOGRAM_BARS = 20;

function PriceHistogram({ allPrices, priceBounds, currentMin, currentMax }: {
  allPrices: number[];
  priceBounds: { min: number; max: number };
  currentMin: number;
  currentMax: number;
}) {
  const buckets = useMemo(() => {
    const range = priceBounds.max - priceBounds.min;
    if (range === 0) return Array(HISTOGRAM_BARS).fill(0);
    const counts = Array(HISTOGRAM_BARS).fill(0);
    for (const price of allPrices) {
      let idx = Math.floor(((price - priceBounds.min) / range) * HISTOGRAM_BARS);
      if (idx >= HISTOGRAM_BARS) idx = HISTOGRAM_BARS - 1;
      counts[idx]++;
    }
    return counts;
  }, [allPrices, priceBounds]);

  const maxCount = Math.max(...buckets, 1);
  const range = priceBounds.max - priceBounds.min;

  return (
    <div className="filter-histogram">
      {buckets.map((count, i) => {
        const barMin = priceBounds.min + (i / HISTOGRAM_BARS) * range;
        const barMax = priceBounds.min + ((i + 1) / HISTOGRAM_BARS) * range;
        const inRange = barMax >= currentMin && barMin <= currentMax;
        const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div
            key={i}
            className={`filter-histogram-bar${inRange ? ' active' : ''}`}
            style={{ height: `${Math.max(heightPct, 2)}%` }}
          />
        );
      })}
    </div>
  );
}

const ratingOptions = [
  { label: '4.5 & up', value: 4.5 },
  { label: '4.7 & up', value: 4.7 },
  { label: '4.9 & up', value: 4.9 },
  { label: '5.0 only', value: 5.0 },
];

const deliveryOptions = [
  { label: 'Up to 2 days', value: 2 },
  { label: 'Up to 3 days', value: 3 },
  { label: 'Up to 5 days', value: 5 },
  { label: 'Up to 10 days', value: 10 },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Delivery Time', value: 'delivery' },
  { label: 'Rating', value: 'rating' },
];

const sortLabels: Record<SortOption, string> = {
  recommended: 'Sort by: Recommended',
  'price-asc': 'Sort by: Price ↑',
  'price-desc': 'Sort by: Price ↓',
  delivery: 'Sort by: Delivery',
  rating: 'Sort by: Rating',
};

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return { open, setOpen, ref };
}

export function FiltersBar({
  resultCount,
  minRating, setMinRating,
  maxDeliveryDays, setMaxDeliveryDays,
  priceRange, setPriceRange,
  priceBounds,
  allPrices,
  sortBy, setSortBy,
}: FiltersBarProps) {
  const ratingDrop = useDropdown();
  const deliveryDrop = useDropdown();
  const priceDrop = useDropdown();
  const sortDrop = useDropdown();

  const currentMin = priceRange ? priceRange[0] : priceBounds.min;
  const currentMax = priceRange ? priceRange[1] : priceBounds.max;

  return (
    <div className="filters-bar">
      <div className="filters-left">
        {/* Top Rated */}
        <div className="filter-dropdown-wrap" ref={ratingDrop.ref}>
          <button
            className={`filter-btn${minRating !== null ? ' active' : ''}`}
            onClick={() => ratingDrop.setOpen(!ratingDrop.open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Top Rated
            {minRating !== null && <span className="filter-btn-value">{minRating}+</span>}
            <svg className="filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {ratingDrop.open && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-title">Minimum Rating</div>
              {ratingOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`filter-dropdown-option${minRating === opt.value ? ' selected' : ''}`}
                  onClick={() => {
                    setMinRating(minRating === opt.value ? null : opt.value);
                    ratingDrop.setOpen(false);
                  }}
                >
                  <span className="filter-dropdown-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} viewBox="0 0 24 24" fill={i < Math.floor(opt.value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </span>
                  {opt.label}
                </button>
              ))}
              {minRating !== null && (
                <button className="filter-dropdown-clear" onClick={() => { setMinRating(null); ratingDrop.setOpen(false); }}>
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Fast Delivery */}
        <div className="filter-dropdown-wrap" ref={deliveryDrop.ref}>
          <button
            className={`filter-btn${maxDeliveryDays !== null ? ' active' : ''}`}
            onClick={() => deliveryDrop.setOpen(!deliveryDrop.open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Fast Delivery
            {maxDeliveryDays !== null && <span className="filter-btn-value">{maxDeliveryDays}d</span>}
            <svg className="filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {deliveryDrop.open && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-title">Maximum Delivery Time</div>
              {deliveryOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`filter-dropdown-option${maxDeliveryDays === opt.value ? ' selected' : ''}`}
                  onClick={() => {
                    setMaxDeliveryDays(maxDeliveryDays === opt.value ? null : opt.value);
                    deliveryDrop.setOpen(false);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {opt.label}
                </button>
              ))}
              {maxDeliveryDays !== null && (
                <button className="filter-dropdown-clear" onClick={() => { setMaxDeliveryDays(null); deliveryDrop.setOpen(false); }}>
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Budget-Friendly */}
        <div className="filter-dropdown-wrap" ref={priceDrop.ref}>
          <button
            className={`filter-btn${priceRange !== null ? ' active' : ''}`}
            onClick={() => priceDrop.setOpen(!priceDrop.open)}
          >
            Budget-Friendly
            {priceRange !== null && <span className="filter-btn-value">${priceRange[0]}–${priceRange[1]}</span>}
            <svg className="filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {priceDrop.open && (
            <div className="filter-dropdown filter-dropdown--wide">
              <div className="filter-dropdown-title">Price Range</div>
              <PriceHistogram
                allPrices={allPrices}
                priceBounds={priceBounds}
                currentMin={currentMin}
                currentMax={currentMax}
              />
              <div className="filter-price-labels">
                <span>${currentMin}</span>
                <span>${currentMax}</span>
              </div>
              <div className="filter-price-slider">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={currentMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPriceRange([Math.min(val, currentMax), currentMax]);
                  }}
                  className="filter-range filter-range--min"
                />
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={currentMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPriceRange([currentMin, Math.max(val, currentMin)]);
                  }}
                  className="filter-range filter-range--max"
                />
                <div className="filter-range-track">
                  <div
                    className="filter-range-fill"
                    style={{
                      left: `${((currentMin - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                      right: `${100 - ((currentMax - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              {priceRange !== null && (
                <button className="filter-dropdown-clear" onClick={() => { setPriceRange(null); priceDrop.setOpen(false); }}>
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="filter-dropdown-wrap" ref={sortDrop.ref}>
          <button className="sort-select-btn" onClick={() => sortDrop.setOpen(!sortDrop.open)}>
            {sortLabels[sortBy]}
            <svg className="filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {sortDrop.open && (
            <div className="filter-dropdown filter-dropdown--right">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`filter-dropdown-option${sortBy === opt.value ? ' selected' : ''}`}
                  onClick={() => { setSortBy(opt.value); sortDrop.setOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
